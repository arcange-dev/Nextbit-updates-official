// Community API: categories, tags and the threaded comment engine.
// Comments are text-only (2–2000 chars), one reply level (parent_id), and
// soft-moderated via a hidden flag that only admins can toggle.
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { hasDatabase, q } from "./db.mjs";

const r = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV==="production"
  ? [...globalThis.crypto.getRandomValues(new Uint8Array(48))].map(b=>b.toString(16).padStart(2,"0")).join("")
  : "dev-only-change-me");if(!process.env.JWT_SECRET&&process.env.NODE_ENV==="production")console.warn("[NextBit][SECURITY] community JWT_SECRET not configured; random per-process secret in use.");;
const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });

const db = (res) => hasDatabase() ? true : (res.status(503).json({ ok: false, error: "The database is offline. Restore Supabase, then try again." }), false);

// Auth middleware (same JWT contract as the main API).
const auth = (req, _res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) throw new Error("no token");
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch { next(Object.assign(new Error("Authentication required"), { status: 401 })); }
};
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch((e) => {
  if (e.status === 401) return res.status(401).json({ ok: false, error: "Sign in to do that" });
  if (e.status === 403) return res.status(403).json({ ok: false, error: e.message || "Forbidden" });
  console.error("[community]", e);
  res.status(503).json({ ok: false, error: ((e.code==="ENOTFOUND"||e.code==="ECONNREFUSED"||e.code==="ETIMEDOUT"||/pooler\.supabase\.com|supabase\.com/.test(String(e.message)))) ? "The database is offline. Restore Supabase, then try again." : "Something went wrong" });
});

// Comment spam guard: 10 posts per 15 minutes per IP.
const commentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-7", legacyHeaders: false });
const bodySchema = z.object({ body: z.string().trim().min(2).max(2000), parentId: z.number().int().positive().optional() });

/* ---------- Taxonomy ---------- */
// GET /api/categories
r.get("/categories", wrap(async (req, res) => {
  if (!db(res)) return;
  const { rows } = await q("SELECT id, name FROM categories ORDER BY name");
  ok(res, rows);
}));

// GET /api/tags
r.get("/tags", wrap(async (req, res) => {
  if (!db(res)) return;
  const { rows } = await q("SELECT t.id, t.name, COUNT(at.article_id)::int AS articles FROM tags t LEFT JOIN article_tags at ON at.tag_id = t.id GROUP BY t.id, t.name ORDER BY articles DESC, t.name");
  ok(res, rows);
}));

/* ---------- Public comments ---------- */
// GET /api/articles/:id/comments -> flat list; the client nests one reply level.
r.get("/articles/:id/comments", wrap(async (req, res) => {
  if (!db(res)) return;
  const after = Number(req.query.after || 0) || 0;
  const { rows } = await q(
    `SELECT c.id, c.article_id, c.parent_id, c.body, c.author_name, c.user_id,
            c.created_at, EXISTS(SELECT 1 FROM comments p WHERE p.parent_id = c.id) AS has_replies
     FROM comments c WHERE c.article_id = $1 AND c.hidden = FALSE AND c.id > $2
     ORDER BY c.created_at ASC LIMIT 100`,
    [req.params.id, after]
  );
  ok(res, rows);
}));

// POST /api/articles/:id/comments -> publish a comment or a reply (auth required)
r.post("/articles/:id/comments", commentLimiter, auth, wrap(async (req, res) => {
  if (!db(res)) return;
  const p = bodySchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ ok: false, error: "Comment must be 2–2000 characters" });
  const { body, parentId } = p.data;
  // Only one reply level: a reply to a reply attaches to the top-level parent.
  let parent = null;
  if (parentId) {
    const pr = await q("SELECT id, parent_id FROM comments WHERE id = $1 AND hidden = FALSE", [parentId]);
    if (!pr.rowCount) return res.status(404).json({ ok: false, error: "The comment you replied to no longer exists" });
    parent = pr.rows[0].parent_id || pr.rows[0].id;
  }
  const ar = await q("SELECT 1 FROM articles WHERE id = $1 AND status = 'published'", [req.params.id]);
  if (!ar.rowCount) return res.status(404).json({ ok: false, error: "Article not found" });
  const { rows } = await q(
    `INSERT INTO comments(article_id, user_id, author_name, parent_id, body)
     VALUES($1,$2,$3,$4,$5)
     RETURNING id, article_id, parent_id, body, author_name, user_id, created_at, FALSE AS has_replies`,
    [req.params.id, req.user.id, req.user.name || "NextBit reader", parent, body]
  );
  ok(res, rows[0], 201);
}));

// DELETE /api/comments/:id -> authors delete their own; admins delete anything.
r.delete("/comments/:id", auth, wrap(async (req, res) => {
  if (!db(res)) return;
  const { rows } = await q("SELECT user_id FROM comments WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Comment not found" });
  const owns = rows[0].user_id === req.user.id;
  if (!owns && req.user.role !== "admin") return res.status(403).json({ ok: false, error: "You can only delete your own comments" });
  await q("DELETE FROM comments WHERE id = $1", [req.params.id]);
  ok(res, { deleted: true });
}));

/* ---------- Admin moderation ---------- */
const requireAdmin = (req, res, next) =>
  req.user?.role === "admin" ? next() : res.status(403).json({ ok: false, error: "Admin access required" });

// GET /api/admin/comments -> latest comments including hidden ones
r.get("/admin/comments", auth, requireAdmin, wrap(async (_req, res) => {
  if (!db(res)) return;
  const { rows } = await q(
    `SELECT c.id, c.body, c.author_name, c.user_id, c.article_id, c.hidden, c.created_at, a.title AS article_title
     FROM comments c LEFT JOIN articles a ON a.id = c.article_id
     ORDER BY c.created_at DESC LIMIT 200`
  );
  ok(res, rows);
}));

// PATCH /api/admin/comments/:id -> hide or unhide a comment
r.patch("/admin/comments/:id", auth, requireAdmin, wrap(async (req, res) => {
  if (!db(res)) return;
  const hidden = req.body?.hidden === true;
  const { rowCount } = await q("UPDATE comments SET hidden = $1 WHERE id = $2", [hidden, req.params.id]);
  if (!rowCount) return res.status(404).json({ ok: false, error: "Comment not found" });
  ok(res, { id: Number(req.params.id), hidden });
}));

// DELETE /api/admin/comments/:id -> permanent removal
r.delete("/admin/comments/:id", auth, requireAdmin, wrap(async (req, res) => {
  if (!db(res)) return;
  await q("DELETE FROM comments WHERE id = $1", [req.params.id]);
  ok(res, { deleted: true });
}));

export default r;
