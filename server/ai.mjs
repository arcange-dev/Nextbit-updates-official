// NextBit AI proxy — server-side LLM access for TL;DR, chat and code explanation.
// Keys stay on the server; the browser never sees them. Set in Render env vars:
//   NEXTBIT_AI_ENDPOINT — OpenAI-compatible chat completions URL
//   NEXTBIT_AI_KEY      — API key for that endpoint
//   NEXTBIT_AI_MODEL    — model name (optional)
import express from "express";

const r = express.Router();
const ok = (res, data) => res.json({ ok: true, data });

// Central LLM call. Falls back to a 503 when the platform is not configured
// so every frontend widget can degrade gracefully instead of crashing.
async function llm({ system, user, json = false, max_tokens = 500 }) {
  const url = process.env.NEXTBIT_AI_ENDPOINT;
  const key = process.env.NEXTBIT_AI_KEY;
  if (!url || !key) throw new Error("ai_not_configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); // hard cap: never hang a request
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.NEXTBIT_AI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...(json && { response_format: { type: "json_object" } }),
        max_tokens,
      }),
    });
    if (!res.ok) throw new Error(`llm_${res.status}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("llm_empty");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

// POST /api/ai/tldr { text } -> { bullets: string[] }
r.post("/tldr", async (req, res) => {
  try {
    const out = await llm({
      system:
        'Summarize technology articles for developers and AI researchers. Respond strictly as JSON: {"bullets":["..."]} with 3-5 bullets, max 20 words each. Be concrete: name technologies, numbers and implications. No fluff.',
      user: String(req.body?.text || "").slice(0, 8000),
      json: true,
    });
    const parsed = JSON.parse(out);
    if (!Array.isArray(parsed.bullets)) throw new Error("bad_shape");
    ok(res, { bullets: parsed.bullets.slice(0, 6) });
  } catch (e) {
    const notConfigured = e.message === "ai_not_configured";
    res.status(notConfigured ? 503 : 502).json({ ok: false, error: notConfigured ? "AI is not configured on the server" : "Summary generation failed" });
  }
});

// POST /api/ai/chat { messages:[{role,content}], articleContext? } -> { reply }
r.post("/chat", async (req, res) => {
  try {
    const history = Array.isArray(req.body?.messages) ? req.body.messages.slice(-8) : [];
    if (!history.length) return res.status(400).json({ ok: false, error: "messages required" });
    const context = String(req.body?.articleContext || "").slice(0, 4000);
    const reply = await llm({
      system:
        "You are NextBit Assistant, a concise AI helper for a technology-intelligence news platform. " +
        (context ? `The reader is currently reading this article:\n"""${context}"""\nAnswer with that context in mind when relevant. ` : "") +
        "Keep replies under 120 words. Plain text only, no markdown headers.",
      user: history.map((m) => `${m.role}: ${m.content}`).join("\n"),
      max_tokens: 300,
    });
    ok(res, { reply });
  } catch (e) {
    const notConfigured = e.message === "ai_not_configured";
    res.status(notConfigured ? 503 : 502).json({ ok: false, error: notConfigured ? "AI is not configured on the server" : "Assistant unavailable" });
  }
});

// POST /api/ai/explain { code, language } -> { explanation }
r.post("/explain", async (req, res) => {
  try {
    const code = String(req.body?.code || "").slice(0, 1500);
    if (!code.trim()) return res.status(400).json({ ok: false, error: "code required" });
    const explanation = await llm({
      system:
        "Explain code snippets to developers in under 60 words: what it does, how it works, and one gotcha if there is one. Plain text.",
      user: `Language: ${String(req.body?.language || "unknown")}\n\n${code}`,
      max_tokens: 160,
    });
    ok(res, { explanation });
  } catch (e) {
    const notConfigured = e.message === "ai_not_configured";
    res.status(notConfigured ? 503 : 502).json({ ok: false, error: notConfigured ? "AI is not configured on the server" : "Explanation unavailable" });
  }
});

export default r;
