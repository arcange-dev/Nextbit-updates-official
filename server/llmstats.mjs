// LLM Stats live mirror — clones AI news and model/tool data from llm-stats.com
// Sources:
//   news   : https://llm-stats.com/ai-news  (schema.org JSON-LD NewsArticle entries)
//   models : https://api.zeroeval.com/leaderboard/models/list + /v1/models/metrics
//            (llm-stats.com's official public JSON distribution)
import express from "express";

const router = express.Router();

const NEWS_URL = "https://llm-stats.com/ai-news";
const MODELS_URL = "https://api.zeroeval.com/leaderboard/models/list";
const METRICS_URL = "https://api.zeroeval.com/v1/models/metrics";

const cache = new Map();
async function cached(key, ttl, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.v;
  const v = await fn();
  cache.set(key, { at: Date.now(), v });
  return v;
}

async function grab(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "NextBit-Updates/1.0 (+nextbit-updates.onrender.com)", accept: "application/json,text/html" },
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

/* Parse the schema.org JSON-LD NewsArticle entries out of the /ai-news page. */
function parseNews(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const arts = [];
  for (const raw of blocks) {
    let doc;
    try { doc = JSON.parse(raw); } catch { continue; }
    const graph = doc?.["@graph"] || [doc];
    for (const g of graph) {
      if (g?.["@type"] !== "NewsArticle") continue;
      // The item URL carries the real source article after the "#item-" fragment marker.
      const m = String(g.url || "").match(/#item-(.+)$/);
      arts.push({
        id: g["@id"] || g.url || g.headline,
        headline: g.headline,
        url: m ? m[1] : g.url,
        publishedAt: g.datePublished,
        source: g.sourceOrganization?.name || "LLM Stats",
      });
    }
  }
  return arts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

/* Flatten org -> models and merge live throughput/latency metrics by model_id. */
async function fetchModels() {
  const [listRaw, metricsRaw] = await Promise.all([grab(MODELS_URL), grab(METRICS_URL).catch(() => "[]")]);
  const orgs = JSON.parse(listRaw);
  const metrics = new Map();
  for (const m of JSON.parse(metricsRaw) || []) metrics.set(m.model_id, m);
  const out = [];
  for (const o of orgs) {
    for (const m of o.models || []) {
      const met = metrics.get(m.model_id) || {};
      out.push({
        id: m.model_id,
        name: m.name || m.model_id,
        org: o.name || m.organization_id,
        releasedAt: m.release_date || null,
        contextWindow: m.context_window ?? null,
        inputPrice: m.inputPrice ?? null,
        outputPrice: m.outputPrice ?? null,
        throughput: met.avg_throughput != null ? Math.round(met.avg_throughput * 10) / 10 : null,
        latencyMs: met.avg_latency != null ? Math.round(met.avg_latency) : null,
      });
    }
  }
  return out.sort((a, b) => (b.releasedAt || "").localeCompare(a.releasedAt || ""));
}

const fail = (res, e) => res.status(502).json({ ok: false, error: "llm-stats.com is unreachable right now — try again shortly." });

/* GET /api/llmstats/news — live AI news cloned from llm-stats.com/ai-news */
router.get("/llmstats/news", async (req, res) => {
  try {
    res.json({ ok: true, data: await cached("news", 10 * 60 * 1000, async () => parseNews(await grab(NEWS_URL))) });
  } catch (e) { fail(res, e); }
});

/* GET /api/llmstats/models — live AI models & tools with pricing/perf, cloned from llm-stats.com */
router.get("/llmstats/models", async (req, res) => {
  try {
    res.json({ ok: true, data: await cached("models", 10 * 60 * 1000, fetchModels) });
  } catch (e) { fail(res, e); }
});

export default router;
