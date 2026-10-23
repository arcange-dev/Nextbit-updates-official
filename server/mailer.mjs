// Newsletter mailer: welcome email on subscribe, one-click unsubscribe, and a
// "send digest" that emails the latest published stories to every subscriber.
// Uses the Resend HTTP API (no SDK, no extra dependency). Activate by setting
// RESEND_API_KEY (and optionally MAIL_FROM) in the Render environment.
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { hasDatabase, q } from "./db.mjs";

const r = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const SITE = (process.env.SITE_URL || "https://nextbit-updates-r6k2.onrender.com").replace(/\/$/, "");
const FROM = process.env.MAIL_FROM || "NextBit Updates <onboarding@resend.dev>";
const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const auth = (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) return res.status(401).json({ ok: false, error: "Sign in to do that" });
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch { return res.status(401).json({ ok: false, error: "Invalid or expired session. Sign in again." }); }
};
const admin = (req, res, next) => req.user?.role === "admin" ? next() : res.status(403).json({ ok: false, error: "Admin access required" });
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch((e) => {
  if (e?.status === 401) return res.status(401).json({ ok: false, error: "Sign in to do that" });
  if (e?.status === 403) return res.status(403).json({ ok: false, error: e.message || "Forbidden" });
  if (e?.issues) return res.status(400).json({ ok: false, error: e.issues[0]?.message || "Invalid input" });
  console.error("[mailer]", e);
  res.status(503).json({ ok: false, error: ((e.code==="ENOTFOUND"||e.code==="ECONNREFUSED"||e.code==="ETIMEDOUT"||/pooler\.supabase\.com|supabase\.com/.test(String(e.message)))) ? "The database is offline. Restore Supabase, then try again." : "Something went wrong" });
});

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY);

/** Low-level send through Resend. Returns { ok, error? } and never throws. */
export async function sendMail({ to, subject, html, text }) {
  if (!mailConfigured()) return { ok: false, error: "Email sending is not configured (missing RESEND_API_KEY)" };
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 15000);
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: c.signal,
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html, text }),
    });
    if (!resp.ok) return { ok: false, error: `Mail provider ${resp.status}: ${(await resp.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (e) { return { ok: false, error: e?.message || "Mail send failed" }; }
  finally { clearTimeout(t); }
}

const unsubToken = (email) => jwt.sign({ email, k: "unsub" }, JWT_SECRET);
const unsubUrl = (email) => `${SITE}/api/newsletter/unsubscribe?t=${encodeURIComponent(unsubToken(email))}`;

const shell = (title, inner, email) => `<!doctype html><html><body style="margin:0;background:#050505;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e6e6e6">
<div style="max-width:620px;margin:0 auto;padding:32px 20px">
  <div style="font-size:11px;letter-spacing:.3em;color:#ff6a00;font-weight:700">NEXTBIT UPDATES</div>
  <h1 style="margin:10px 0 0;font-size:30px;line-height:1.2;color:#fff">${esc(title)}</h1>
  <div style="height:3px;width:110px;margin:16px 0 24px;background:linear-gradient(90deg,#ff6a00,#a855f7,#22d3ee);border-radius:3px"></div>
  ${inner}
  <div style="margin-top:36px;padding-top:18px;border-top:1px solid #222;font-size:12px;color:#777;line-height:1.7">
    You are receiving this because ${esc(email)} subscribed to The NextBit Brief.<br>
    <a href="${unsubUrl(email)}" style="color:#22d3ee">Unsubscribe</a> &nbsp;·&nbsp; <a href="${SITE}" style="color:#22d3ee">Visit NextBit Updates</a>
  </div>
</div></body></html>`;

const welcomeHtml = (email) => shell("Welcome to The NextBit Brief", `
  <p style="font-size:16px;line-height:1.7;color:#cfcfcf">Thanks for subscribing. You'll get verified technology news, AI model launches, Africa tech stories and opportunities straight to your inbox.</p>
  <div style="margin:22px 0;padding:18px;border:1px solid #2a2a2a;border-radius:12px;background:#0c0c0f">
    <div style="color:#00ff9d;font-size:12px;letter-spacing:.2em;font-weight:700">WHAT YOU GET</div>
    <ul style="margin:10px 0 0;padding-left:18px;line-height:1.9;color:#cfcfcf"><li>Top tech and AI headlines, verified</li><li>Africa tech and startup spotlights</li><li>Scholarships, internships and remote jobs</li><li>New roadmaps and build projects</li></ul>
  </div>
  <a href="${SITE}/#/news" style="display:inline-block;background:linear-gradient(100deg,#ff6a00,#a855f7);color:#050505;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:999px">Read today's news</a>`, email);

/** Welcome email helper used by the subscribe route. Fire-and-forget safe. */
export async function sendWelcome(email) {
  return sendMail({ to: email, subject: "Welcome to The NextBit Brief", html: welcomeHtml(email), text: `Welcome to The NextBit Brief! Read today's news: ${SITE}/#/news\nUnsubscribe: ${unsubUrl(email)}` });
}

let migrated = false;
const migrate = async () => {
  if (migrated || !hasDatabase()) return;
  for (const stmt of [
    "ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN NOT NULL DEFAULT FALSE",
    "ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ",
  ]) { try { await q(stmt); } catch (e) { console.error("[mailer][migrate]", e.message); } }
  migrated = true;
};

/* One-click unsubscribe (linked from every email footer). */
r.get("/newsletter/unsubscribe", wrap(async (req, res) => {
  let email = "";
  try { const d = jwt.verify(String(req.query.t || ""), JWT_SECRET); if (d.k === "unsub") email = d.email; } catch {}
  if (!email) return res.status(400).type("html").send("<h2 style='font-family:sans-serif'>This unsubscribe link is invalid or expired.</h2>");
  if (hasDatabase()) { await migrate(); await q("UPDATE newsletter_subscribers SET unsubscribed=TRUE WHERE email=LOWER($1)", [email]); }
  res.type("html").send(`<body style="margin:0;background:#050505;color:#fff;font-family:Inter,Arial,sans-serif;display:grid;place-items:center;min-height:100vh"><div style="max-width:440px;text-align:center;padding:24px"><div style="color:#ff6a00;letter-spacing:.3em;font-size:11px;font-weight:700">NEXTBIT UPDATES</div><h1>You're unsubscribed</h1><p style="color:#aaa;line-height:1.7">${esc(email)} will no longer receive The NextBit Brief. Changed your mind? Re-subscribe anytime on the site.</p><a href="${SITE}" style="color:#22d3ee">Back to NextBit Updates</a></div></body>`);
}));

/* Admin: digest of the latest published stories → all active subscribers. */
r.post("/admin/newsletter/send", auth, admin, wrap(async (req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "The database is offline. Restore Supabase, then try again." });
  if (!mailConfigured()) return res.status(412).json({ ok: false, error: "Email sending is not configured. Add RESEND_API_KEY in the Render environment." });
  await migrate();
  const body = z.object({ subject: z.string().trim().min(3).max(140).optional(), intro: z.string().trim().max(600).optional(), testTo: z.string().email().optional() }).parse(req.body || {});
  const stories = (await q("SELECT id, title, summary, category, image_url FROM articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 6")).rows;
  if (!stories.length) return res.status(400).json({ ok: false, error: "No published stories to send yet." });
  const subject = body.subject || `The NextBit Brief — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  const list = body.testTo ? [{ email: body.testTo }] : (await q("SELECT email FROM newsletter_subscribers WHERE unsubscribed=FALSE")).rows;
  const items = (email) => stories.map((a) => `
    <div style="margin:0 0 18px;padding:16px;border:1px solid #232323;border-radius:12px;background:#0c0c0f">
      ${a.image_url ? `<img src="${esc(a.image_url)}" alt="" width="560" style="max-width:100%;border-radius:8px;margin-bottom:10px;display:block">` : ""}
      <div style="color:#ff6a00;font-size:11px;letter-spacing:.2em;font-weight:700">${esc(String(a.category).toUpperCase())}</div>
      <a href="${SITE}/#/article/${esc(a.id)}" style="display:block;margin:6px 0;color:#fff;font-size:19px;font-weight:700;text-decoration:none">${esc(a.title)}</a>
      <div style="color:#aaa;font-size:14px;line-height:1.6">${esc(String(a.summary || "").slice(0, 200))}</div>
    </div>`).join("");
  let sent = 0, failed = 0, lastError = "";
  for (const s of list) {
    const html = shell(subject, `${body.intro ? `<p style="font-size:15px;line-height:1.7;color:#cfcfcf">${esc(body.intro)}</p>` : ""}${items(s.email)}`, s.email);
    const out = await sendMail({ to: s.email, subject, html });
    if (out.ok) { sent++; if (!body.testTo) { try { await q("UPDATE newsletter_subscribers SET last_sent_at=NOW() WHERE email=$1", [s.email]); } catch {} } }
    else { failed++; lastError = out.error; }
  }
  return ok(res, { recipients: list.length, sent, failed, lastError: lastError || undefined });
}));

// GET /api/admin/newsletter/subscribers -> the full subscriber list for the admin panel.
r.get("/admin/newsletter/subscribers", auth, admin, wrap(async (req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "The database is offline. Restore Supabase, then try again." });
  await migrate();
  const search = String(req.query.q || "").trim().slice(0, 120);
  const params = [];
  let where = "";
  if (search) { params.push("%" + search.toLowerCase() + "%"); where = "WHERE LOWER(email) LIKE $1"; }
  const rows = (await q(
    `SELECT id, email, unsubscribed, created_at, last_sent_at FROM newsletter_subscribers ${where} ORDER BY created_at DESC LIMIT 500`,
    params
  )).rows;
  return ok(res, { items: rows, total: rows.length });
}));

r.get("/admin/newsletter/status", auth, admin, wrap(async (_req, res) => {
  let subscribers = 0, active = 0;
  if (hasDatabase()) {
    await migrate();
    try { const x = (await q("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE unsubscribed=FALSE)::int AS active FROM newsletter_subscribers")).rows[0]; subscribers = x.total; active = x.active; } catch {}
  }
  return ok(res, { configured: mailConfigured(), from: FROM, subscribers, active });
}));

export default r;
