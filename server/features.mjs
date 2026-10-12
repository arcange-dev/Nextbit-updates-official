// NextBit interactive dev-tools layer: AI tools directory, votes, tech events,
// global outage status and GitHub trending — all served through the Express API
// so the frontend needs no extra credentials. Data lives in the same PostgreSQL
// database as the rest of the platform (see initFeatureTables in db.mjs).
import express from "express";
import crypto from "node:crypto";
import { hasDatabase, q } from "./db.mjs";

const r = express.Router();
const ok = (res, data) => res.json({ ok: true, data });

/* ---------- AI tools directory ---------- */
// GET /api/tools -> tools with live vote totals
r.get("/tools", async (_req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "Database is not configured" });
  try {
    const { rows } = await q(`
      SELECT t.id, t.name, t.category, t.description, t.url, t.tags,
             COALESCE(v.total, 0)::int AS votes
      FROM ai_tools t
      LEFT JOIN (SELECT target_id, SUM(value) AS total FROM votes WHERE kind = 'tool' GROUP BY target_id) v
        ON v.target_id = t.id
      ORDER BY votes DESC, t.name ASC LIMIT 300`);
    ok(res, rows);
  } catch (e) {
    console.error("tools", e);
    res.status(500).json({ ok: false, error: "Could not load the AI directory" });
  }
});

/* ---------- Tech events calendar ---------- */
// GET /api/events -> upcoming hackathons, releases and conferences
r.get("/events", async (_req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "Database is not configured" });
  try {
    const { rows } = await q(
      "SELECT id, title, kind, starts_at, url, location FROM events WHERE starts_at >= NOW() ORDER BY starts_at ASC LIMIT 50"
    );
    ok(res, rows);
  } catch (e) {
    console.error("events", e);
    res.status(500).json({ ok: false, error: "Could not load events" });
  }
});

/* ---------- Reddit-style votes (stories + directory tools) ---------- */
// Vote deduplication happens on a (target, kind, voter) primary key in Postgres,
// so a double-click or replayed request can never inflate a count.
r.post("/vote", async (req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "Database is not configured" });
  const target = String(req.body?.target || "").slice(0, 220);
  const kind = req.body?.kind === "tool" ? "tool" : "story";
  const voter = String(req.body?.voter || "").slice(0, 80);
  const value = Number(req.body?.value);
  if (!target || !voter || ![1, -1].includes(value)) return res.status(400).json({ ok: false, error: "Invalid vote" });
  try {
    const { rows } = await q(
      `INSERT INTO votes (target_id, kind, voter, value) VALUES ($1, $2, $3, $4)
       ON CONFLICT (target_id, kind, voter)
       DO UPDATE SET value = CASE WHEN votes.value = $4 THEN 0 ELSE $4 END
       RETURNING (SELECT COALESCE(SUM(value), 0)::int FROM votes WHERE target_id = $1 AND kind = $2) AS count`,
      [target, kind, voter, value]
    );
    ok(res, { count: rows[0].count });
  } catch (e) {
    console.error("vote", e);
    res.status(500).json({ ok: false, error: "Vote failed" });
  }
});

// GET /api/votes?kind=story&targets=a,b,c&voter=x -> { targetId: { count, mine } }
// One batched request per card grid, not one per card.
r.get("/votes", async (req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "Database is not configured" });
  const kind = req.query.kind === "tool" ? "tool" : "story";
  const targets = String(req.query.targets || "").split(",").filter(Boolean).slice(0, 100);
  const voter = String(req.query.voter || "").slice(0, 80);
  if (!targets.length) return ok(res, {});
  try {
    const { rows } = await q(
      `SELECT target_id,
              COALESCE(SUM(value), 0)::int AS count,
              COALESCE(SUM(CASE WHEN voter = $2 THEN value ELSE 0 END), 0)::int AS mine
       FROM votes WHERE kind = $1 AND target_id = ANY($3) GROUP BY target_id`,
      [kind, voter, targets]
    );
    ok(res, Object.fromEntries(rows.map((row) => [row.target_id, { count: row.count, mine: row.mine }])));
  } catch (e) {
    console.error("votes", e);
    res.status(500).json({ ok: false, error: "Could not load votes" });
  }
});

/* ---------- Global outage status board (60s server cache) ---------- */
let statusCache = { at: 0, data: null };
const STATUS_SOURCES = [
  { id: "github", label: "GitHub", url: "https://www.githubstatus.com/api/v2/status.json" },
  { id: "openai", label: "OpenAI", url: "https://status.openai.com/api/v2/status.json" },
  { id: "anthropic", label: "Anthropic", url: "https://status.anthropic.com/api/v2/status.json" },
  { id: "cloudflare", label: "Cloudflare", url: "https://www.cloudflarestatus.com/api/v2/status.json" },
  { id: "vercel", label: "Vercel", url: "https://www.vercel-status.com/api/v2/status.json" },
];
r.get("/status", async (_req, res) => {
  if (statusCache.data && Date.now() - statusCache.at < 60_000) return ok(res, statusCache.data);
  const rows = await Promise.all(
    STATUS_SOURCES.map(async (s) => {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 5000);
        const resp = await fetch(s.url, { signal: controller.signal });
        clearTimeout(t);
        const d = await resp.json();
        return { id: s.id, label: s.label, status: d?.status?.indicator || "unknown", description: d?.status?.description || "" };
      } catch {
        return { id: s.id, label: s.label, status: "unknown", description: "" };
      }
    })
  );
  statusCache = { at: Date.now(), data: rows };
  ok(res, rows);
});

/* ---------- GitHub trending widget (5min server cache) ---------- */
// Uses the optional GITHUB_TOKEN server-side (never exposed to the browser).
let trendCache = { at: 0, data: null };
r.get("/trends", async (_req, res) => {
  if (trendCache.data && Date.now() - trendCache.at < 300_000) return ok(res, trendCache.data);
  try {
    const week = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const url = `https://api.github.com/search/repositories?q=created:%3E${week}+stars:%3E100&sort=stars&per_page=5`;
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "nextbit-updates",
      ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
    };
    const json = await (await fetch(url, { headers })).json();
    const data = (json.items || []).map((x) => ({
      name: x.full_name,
      description: x.description,
      stars: x.stargazers_count,
      url: x.html_url,
    }));
    trendCache = { at: Date.now(), data };
    ok(res, data);
  } catch (e) {
    console.error("trends", e);
    res.status(502).json({ ok: false, error: "Trending repos unavailable" });
  }
});

export default r;
