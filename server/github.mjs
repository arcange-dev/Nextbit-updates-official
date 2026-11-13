// Trending GitHub repos by technology field, via the public GitHub Search API.
// GET /api/trends/field/:field -> top repos pushed in the last 90 days, ranked by stars.
// Cached 10 minutes per field; a background warm refresh (every 6 hours, boot included)
// keeps every field hot so visitors always get the current best repos instantly.
import express from "express";

const router = express.Router();

export const FIELDS = {
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

const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map();

async function fetchField(key) {
  const f = FIELDS[key] || FIELDS.all;
  const since = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  // Rank by stars among repos actively pushed in the last 90 days: the current best, not stale legends.
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
    return v;
  } finally {
    clearTimeout(timer);
  }
}

/* Warm every field into the cache, paced to stay far inside GitHub rate limits. */
export async function warmTrends() {
  let ok = 0;
  for (const key of Object.keys(FIELDS)) {
    try {
      await fetchField(key);
      ok += 1;
    } catch (e) {
      console.warn(`[github] warm ${key} failed:`, e?.message);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  return { warmed: ok, total: Object.keys(FIELDS).length };
}

router.get("/trends/field/:field", async (req, res) => {
  const key = req.params.field in FIELDS ? req.params.field : "all";
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) {
    return res.json({ ok: true, data: hit.v, refreshedAt: new Date(hit.at).toISOString() });
  }
  try {
    const v = await fetchField(key);
    res.json({ ok: true, data: v, refreshedAt: new Date().toISOString() });
  } catch (e) {
    // Serve the last good snapshot rather than failing the page.
    if (hit) return res.json({ ok: true, data: hit.v, stale: true, refreshedAt: new Date(hit.at).toISOString() });
    res.status(502).json({ ok: false, error: "GitHub trending is unavailable right now — try again shortly." });
  }
});

export default router;
