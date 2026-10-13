// Platform extras: CLI/terminal news feed, tech market quotes, changelog radar,
// the AI & tech job board, quiz XP, reader stats and newsletter micro-verticals.
// Mounted under /api — all routes validate input with zod and degrade gracefully
// when the database is not configured.
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { hasDatabase, q } from "./db.mjs";

const r = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
const needDb = (res) => hasDatabase() ? true : (res.status(503).json({ ok: false, error: "Database is not configured" }), false);
const auth = (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) return res.status(401).json({ ok: false, error: "Sign in to do that" });
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch { return res.status(401).json({ ok: false, error: "Invalid or expired session. Sign in again." }); }
};
const requireAdmin = (req, _res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.admin === true || req.user.isAdmin === true)) return next();
  return res.status(403).json({ ok: false, error: "Admin access required" });
};
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch((e) => {
  if (e?.issues) return res.status(400).json({ ok: false, error: e.issues[0]?.message || "Invalid input" });
  return res.status(500).json({ ok: false, error: "Something went wrong", detail: e?.message || String(e) });
  if (e?.status === 401) return res.status(401).json({ ok: false, error: "Sign in to do that" });
  if (e?.status === 403) return res.status(403).json({ ok: false, error: e.message || "Forbidden" });
  console.error("[platform]", e);
  res.status(500).json({ ok: false, error: "Something went wrong" });
});

let migrated = false;
const migrate = async () => {
  if (migrated || !hasDatabase()) return;
  // each step is isolated: one failing step never blocks the others
  const steps = [
    `CREATE TABLE IF NOT EXISTS jobs(
      id TEXT PRIMARY KEY,
      title VARCHAR(120) NOT NULL,
      company VARCHAR(80) NOT NULL,
      location VARCHAR(80) DEFAULT 'Remote',
      workplace VARCHAR(10) DEFAULT 'remote',
      tag VARCHAR(20) DEFAULT 'AI',
      salary_min INT DEFAULT 0,
      salary_max INT DEFAULT 0,
      currency VARCHAR(8) DEFAULT 'USD',
      stack TEXT[] DEFAULT '{}',
      apply_url TEXT NOT NULL,
      description TEXT DEFAULT '',
      status VARCHAR(10) DEFAULT 'live',
      created_at TIMESTAMPTZ DEFAULT now())`,
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0",
    "ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS prefs jsonb DEFAULT '[]'",
  ];
  for (const step of steps) {
    try { await q(step); }
    catch (e) { console.error("[platform][migrate]", e.message); }
  }
  migrated = true;
};

/* ---------- 1) Terminal / CLI news reader: curl https://…/api/cli/news ---------- */
r.get("/cli/news", wrap(async (req, res) => {
  const md = (req.query.format || "") === "md";
  let rows = [];
  try {
    if (hasDatabase()) rows = (await q("SELECT id, title, category, summary, published_at FROM articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 5")).rows;
  } catch {}
  const c = (code, s) => (md ? s : `\x1b[${code}m${s}\x1b[0m`);
  let out = md ? "# NextBit Updates — latest 5\n" : c("1", "NEXTBIT UPDATES") + c("2", " — latest 5 headlines\n");
  if (!rows.length) out += "\n  (no published articles yet — feed warming up)";
  rows.forEach((a, i) => {
    const date = new Date(a.published_at || Date.now()).toISOString().slice(0, 10);
    const url = `${req.protocol}://${req.get("host")}/#/article/${a.id}`;
    if (md) out += `\n${i + 1}. [${a.category}] ${a.title} (${date})\n   ${a.summary || ""}\n   ${url}\n`;
    else out += `\n${c("1", `${i + 1}. ${a.title}`)}\n   ${c("35", a.category)}  ${c("2", date)}\n   ${(a.summary || "").slice(0, 140)}\n   ${c("36", url)}\n`;
  });
  res.type("text/plain; charset=utf-8").send(out.trim() + "\n");
}));

/* ---------- 7) AI & tech market quotes (Yahoo Finance chart API, cached) ---------- */
const quoteCache = { at: 0, v: null };
const SYMBOLS = ["NVDA", "MSFT", "GOOGL", "TSM", "AVGO"]; // AI + tech infrastructure
r.get("/quotes", wrap(async (_req, res) => {
  if (quoteCache.v && Date.now() - quoteCache.at < 10 * 60 * 1000) return ok(res, quoteCache.v);
  const out = await Promise.all(SYMBOLS.map(async (s) => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const resp = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${s}?interval=1d&range=2d`, { signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64)" } });
      clearTimeout(timer);
      if (!resp.ok) return null;
      const meta = (await resp.json())?.chart?.result?.[0]?.meta;
      if (!meta?.regularMarketPrice) return null;
      const prev = meta.chartPreviousClose ?? meta.previousClose;
      const px = meta.regularMarketPrice;
      return { symbol: s, price: px, changePct: prev ? +((((px - prev) / prev) * 100)).toFixed(2) : 0 };
    } catch { return null; }
  }));
  const data = out.filter(Boolean);
  if (data.length) { quoteCache.v = data; quoteCache.at = Date.now(); }
  return ok(res, data);
}));

/* ---------- 5) Changelog radar: GitHub releases proxy, 30-min cache ---------- */
const ghCache = new Map();
r.get("/changelog", wrap(async (req, res) => {
  const repo = String(req.query.repo || "");
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return res.status(400).json({ ok: false, error: "Provide ?repo=owner/name" });
  const hit = ghCache.get(repo);
  if (hit && Date.now() - hit.at < 30 * 60 * 1000) return ok(res, hit.v);
  const headers = { accept: "application/vnd.github+json", "user-agent": "NextBit-Updates" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=5`, { headers, signal: ctrl.signal });
    if (!resp.ok) throw new Error("upstream " + resp.status);
    const v = (await resp.json()).map((x) => ({ tag: x.tag_name || x.name, name: x.name, date: x.published_at, notes: (x.body || "").slice(0, 1200) }));
    ghCache.set(repo, { at: Date.now(), v });
    return ok(res, v);
  } finally { clearTimeout(timer); }
}));

/* ---------- 3) Job board ---------- */
const jobSchema = z.object({
  title: z.string().trim().min(4).max(120),
  company: z.string().trim().min(2).max(80),
  location: z.string().trim().max(80).default("Remote"),
  workplace: z.enum(["remote", "onsite", "hybrid"]).default("remote"),
  tag: z.enum(["AI", "Frontend", "Backend", "DevOps", "Data", "Security"]).default("AI"),
  salaryMin: z.coerce.number().int().min(0).max(100000000).default(0),
  salaryMax: z.coerce.number().int().min(0).max(100000000).default(0),
  currency: z.string().trim().min(1).max(8).default("USD"),
  stack: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  applyUrl: z.string().url().max(500),
  description: z.string().trim().max(3000).default(""),
});

r.get("/jobs", wrap(async (req, res) => {
  if (!needDb(res)) return;
  await migrate();
  const params = [];
  let sql = "SELECT * FROM jobs WHERE status='live'";
  if (req.query.tag) { params.push(String(req.query.tag)); sql += " AND tag=$1"; }
  if (req.query.q) {
    params.push("%" + String(req.query.q).toLowerCase() + "%");
    sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(company) LIKE $${params.length} OR LOWER(stack::text) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
  }
  sql += " ORDER BY created_at DESC LIMIT 60";
  try { return ok(res, (await q(sql, params)).rows); }
  catch (e) { console.error("[platform][jobs]", e.message); return res.status(500).json({ ok: false, error: "jobs table unavailable", detail: e.message }); }
}));

// Public recruiter submission → pending review until an admin approves it.
r.post("/jobs", wrap(async (req, res) => {
  if (!needDb(res)) return;
  await migrate();
  const a = jobSchema.parse(req.body || {});
  const id = randomUUID();
  await q("INSERT INTO jobs(id,title,company,location,workplace,tag,salary_min,salary_max,currency,stack,apply_url,description,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending')",
    [id, a.title, a.company, a.location, a.workplace, a.tag, a.salaryMin, a.salaryMax, a.currency, a.stack, a.applyUrl, a.description]);
  return ok(res, { id, status: "pending" }, 201);
}));

r.get("/admin/jobs", auth, requireAdmin, wrap(async (_req, res) => {
  if (!needDb(res)) return;
  await migrate();
  return ok(res, (await q("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 200")).rows);
}));

r.post("/admin/jobs", auth, requireAdmin, wrap(async (req, res) => {
  if (!needDb(res)) return;
  await migrate();
  const a = jobSchema.parse(req.body || {});
  const id = randomUUID();
  await q("INSERT INTO jobs(id,title,company,location,workplace,tag,salary_min,salary_max,currency,stack,apply_url,description,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'live')",
    [id, a.title, a.company, a.location, a.workplace, a.tag, a.salaryMin, a.salaryMax, a.currency, a.stack, a.applyUrl, a.description]);
  return ok(res, { id }, 201);
}));

r.post("/admin/jobs/:id/publish", auth, requireAdmin, wrap(async (req, res) => {
  if (!needDb(res)) return;
  await migrate();
  await q("UPDATE jobs SET status='live' WHERE id=$1", [req.params.id]);
  return ok(res, { published: true });
}));

r.delete("/admin/jobs/:id", auth, requireAdmin, wrap(async (req, res) => {
  if (!needDb(res)) return;
  await migrate();
  await q("DELETE FROM jobs WHERE id=$1", [req.params.id]);
  return ok(res, { deleted: true });
}));

/* ---------- 6) Quiz XP attribution + reader stats ---------- */
r.post("/quiz/complete", auth, wrap(async (req, res) => {
  if (!needDb(res)) return;
  await migrate();
  const { articleId, score } = z.object({ articleId: z.string().max(80).default("general"), score: z.coerce.number().int().min(0).max(100) }).parse(req.body || {});
  const xp = Math.round(score / 10) * 5 + (score === 100 ? 10 : 0); // 0–60 XP per quiz
  const out = await q("UPDATE users SET xp = COALESCE(xp,0) + $1 WHERE id=$2 RETURNING xp", [xp, req.user.id]);
  if (!out.rowCount) return res.status(404).json({ ok: false, error: "Account not found" });
  return ok(res, { awarded: xp, total: out.rows[0].xp });
}));

r.get("/my/stats", auth, wrap(async (req, res) => {
  if (!needDb(res)) return;
  await migrate();
  const u = await q("SELECT COALESCE(xp,0) AS xp FROM users WHERE id=$1", [req.user.id]);
  let comments = 0, bookmarks = 0;
  try { comments = (await q("SELECT COUNT(*)::int AS n FROM comments WHERE user_id=$1 AND hidden=FALSE", [req.user.id])).rows[0].n; } catch {}
  try { bookmarks = (await q("SELECT COUNT(*)::int AS n FROM bookmarks WHERE user_id=$1", [req.user.id])).rows[0].n; } catch {}
  return ok(res, { xp: u.rows[0]?.xp || 0, comments, bookmarks });
}));

/* ---------- 8) Newsletter micro-vertical preferences ---------- */
const PREF_KEYS = ["ai-models", "ai-policy", "cybersecurity", "startups-africa", "hardware", "dev-tools", "cloud", "jobs", "events", "market"];
r.post("/newsletter/prefs", wrap(async (req, res) => {
  if (!needDb(res)) return;
  await migrate();
  const a = z.object({ email: z.string().email().max(200), prefs: z.array(z.enum(PREF_KEYS)).max(PREF_KEYS.length).default([]) }).parse(req.body || {});
  const out = await q("UPDATE newsletter_subscribers SET prefs=$2 WHERE email=$1 RETURNING email", [a.email.toLowerCase(), JSON.stringify(a.prefs)]);
  if (!out.rowCount) return res.status(404).json({ ok: false, error: "Subscribe with this email first, then set preferences" });
  return ok(res, { saved: true });
}));

/* ---------- News images: fetch the original source's og:image ---------- */
const ogImage = async (url) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 9000);
  try {
    const resp = await fetch(String(url), { signal: c.signal, headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36", accept: "text/html" }, redirect: "follow" });
    if (!resp.ok) return null;
    const html = (await resp.text()).slice(0, 400000);
    const m = html.match(/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']/i) || html.match(/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']/i) || html.match(/<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']/i) || html.match(/<img[^>]+src=["\']([^"\']+)["\']/i);
    if (!m) return null;
    try { return new URL(m[1], String(url)).href; } catch { return m[1]; }
  } catch { return null; }
  finally { clearTimeout(t); }
};
r.post("/admin/backfill-images", auth, requireAdmin, wrap(async (_req, res) => {
  if (!needDb(res)) return;
  const rows = (await q("SELECT id, source_url FROM articles WHERE (image_url IS NULL OR image_url='') AND source_url IS NOT NULL AND source_url <> '' LIMIT 30")).rows;
  let updated = 0;
  for (const a of rows) {
    const img = await ogImage(a.source_url);
    if (img) { try { await q("UPDATE articles SET image_url=$1 WHERE id=$2", [img, a.id]); updated++; } catch {} }
  }
  return ok(res, { checked: rows.length, updated });
}));

export default r;
