// Trending GitHub repos by technology field, via the public GitHub Search API.
// GET /api/trends/field/:field -> top repos updated in the last 90 days, ranked by stars. Cached 10 minutes.
import express from "express";

const router = express.Router();

const FIELDS = {
  all: { q: "stars:>800", label: "All fields" },
  ai: { q: "topic:ai stars:>150", label: "AI & ML" },
  web: { q: "topic:react stars:>200", label: "Web" },
  security: { q: "topic:security stars:>150", label: "Security" },
  systems: { q: "language:rust stars:>300", label: "Systems" },
  data: { q: "topic:data-engineering stars:>50", label: "Data" },
  iot: { q: "topic:iot stars:>100", label: "IoT & Hardware" },
  mobile: { q: "topic:android stars:>200", label: "Mobile" },
  devops: { q: "topic:devops stars:>100", label: "DevOps" },
};

const cache = new Map();

router.get("/trends/field/:field", async (req, res) => {
  const key = req.params.field;
  const f = FIELDS[key] || FIELDS.all;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return res.json({ ok: true, data: hit.v });
  const since = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  const url = `https://api.github.com/search/repositories?sort=stars&order=desc&per_page=12&q=${encodeURIComponent(`${f.q} pushed:>${since}`)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "NextBit-Updates/1.0",
        ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
    if (!r.ok) throw new Error(`GitHub API ${r.status}`);
    const j = await r.json();
    const v = (j.items || []).map((x) => ({
      name: x.full_name,
      description: x.description,
      stars: x.stargazers_count,
      language: x.language,
      url: x.html_url,
      pushedAt: x.pushed_at,
    }));
    cache.set(key, { at: Date.now(), v });
    res.json({ ok: true, data: v });
  } catch (e) {
    res.status(502).json({ ok: false, error: "GitHub trending is unavailable right now — try again shortly." });
  } finally {
    clearTimeout(timer);
  }
});

export default router;
