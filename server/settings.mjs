// Site settings: copyright wording, footer tagline and theme colors.
// Single settings row in Postgres; safe, hardcoded defaults when the DB is
// unavailable, so the public site never breaks. {year} in the copyright text
// auto-expands to the current year, so only the wording needs a yearly update.
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { hasDatabase, q } from "./db.mjs";

const r = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });

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
  console.error("[settings]", e);
  res.status(503).json({ ok: false, error: ((e.code==="ENOTFOUND"||e.code==="ECONNREFUSED"||e.code==="ETIMEDOUT"||/pooler\.supabase\.com|supabase\.com/.test(String(e.message)))) ? "The database is offline. Restore Supabase, then try again." : "Something went wrong" });
});

export const SETTINGS_DEFAULTS = {
  copyrightText: "© {year} NextBit Updates · Technology intelligence for the future.",
  footerTagline: "Your gateway to the future of technology — verified news, global ICT roadmaps and real-world projects.",
  heroTagline: "Intelligence for the next generation of builders.",
  colorPrimary: "#ff6a00",
  colorAccent: "#a855f7",
  colorHighlight: "#00ff9d",
};

let migrated = false;
const migrate = async () => {
  if (migrated || !hasDatabase()) return;
  try {
    await q("CREATE TABLE IF NOT EXISTS site_settings(id INT PRIMARY KEY DEFAULT 1, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT one_row CHECK (id = 1))");
    await q("INSERT INTO site_settings(id, data) VALUES(1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING");
  } catch (e) { console.error("[settings][migrate]", e.message); }
  migrated = true;
};

const read = async () => {
  if (hasDatabase()) {
    await migrate();
    try {
      const row = (await q("SELECT data FROM site_settings WHERE id=1")).rows[0];
      if (row?.data) return { ...SETTINGS_DEFAULTS, ...row.data };
    } catch (e) { console.error("[settings][read]", e.message); }
  }
  return { ...SETTINGS_DEFAULTS };
};

const schema = z.object({
  copyrightText: z.string().trim().min(3).max(300),
  footerTagline: z.string().trim().min(3).max(300),
  heroTagline: z.string().trim().max(300).default(""),
  colorPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorHighlight: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

/* Public: the whole site reads branding/colors from here. */
r.get("/settings", wrap(async (_req, res) => ok(res, await read())));

/* Admin: save settings. */
r.put("/admin/settings", auth, admin, wrap(async (req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "The database is unavailable. Restore Supabase to save settings." });
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ ok: false, error: p.error.issues[0]?.message || "Invalid settings" });
  await migrate();
  const data = { ...p.data, heroTagline: p.data.heroTagline || SETTINGS_DEFAULTS.heroTagline };
  await q("UPDATE site_settings SET data=$1, updated_at=NOW() WHERE id=1", [JSON.stringify(data)]);
  return ok(res, { ...SETTINGS_DEFAULTS, ...data, saved: true });
}));

export default r;
