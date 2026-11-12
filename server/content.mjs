// Devices + Opportunities content engine.
// Devices are cloned automatically from Wikipedia/Wikimedia (free, attributed, no key):
// each device gets its image, summary and a source link, refreshed on a schedule.
import express from "express";
import jwt from "jsonwebtoken";
import { hasDatabase, q } from "./db.mjs";

const r = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
const auth = (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) throw new Error("no token");
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch { res.status(401).json({ ok: false, error: "Sign in to do that" }); }
};
const adminOnly = (req, res, next) => (req.user?.role === "admin" ? next() : res.status(403).json({ ok: false, error: "Admin access required" }));
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch((e) => {
  console.error("[content]", e?.message || e);
  res.status(503).json({ ok: false, error: "This section is temporarily unavailable. Try again shortly." });
});

/* ---------- Devices catalogue ---------- */
const WIKI = "https://en.wikipedia.org/w/api.php";
const CATEGORIES = [
  ["Smartphones", "iPhone 17 Pro"],
  ["Smartphones", "Samsung Galaxy S25 Ultra"],
  ["Smartphones", "Google Pixel 10"],
  ["Smartphones", "Xiaomi 15"],
  ["Smartphones", "OnePlus 13"],
  ["Smartphones", "Samsung Galaxy A56"],
  ["Smartphones", "Tecno Camon"],
  ["Smartphones", "Infinix Note"],
  ["Laptops & PCs", "MacBook Pro"],
  ["Laptops & PCs", "MacBook Air"],
  ["Laptops & PCs", "Dell XPS 13"],
  ["Laptops & PCs", "ThinkPad X1 Carbon"],
  ["Laptops & PCs", "Surface Laptop"],
  ["Laptops & PCs", "HP Spectre"],
  ["Laptops & PCs", "Asus ROG"],
  ["Laptops & PCs", "Raspberry Pi 5"],
  ["TVs", "LG OLED TV"],
  ["TVs", "Samsung QLED"],
  ["TVs", "Sony Bravia"],
  ["Tablets", "iPad Pro"],
  ["Tablets", "Samsung Galaxy Tab"],
  ["Tablets", "Surface Pro"],
  ["Wearables", "Apple Watch"],
  ["Wearables", "Samsung Galaxy Watch"],
  ["Wearables", "Garmin Forerunner"],
  ["Audio", "AirPods Pro"],
  ["Audio", "Sony WH-1000XM5"],
  ["Audio", "Bose QuietComfort"],
  ["Consoles", "PlayStation 5"],
  ["Consoles", "Xbox Series X and Series S"],
  ["Consoles", "Nintendo Switch"],
  ["Cameras", "Canon EOS R"],
  ["Cameras", "Sony Alpha 7"],
];

async function wikiSearch(term) {
  const u = `${WIKI}?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=4&prop=pageimages|extracts&exintro=1&explaintext=1&exlimit=max&pithumbsize=640&format=json&origin=*`;
  const res = await fetch(u, { headers: { "user-agent": "NextBitUpdates/1.0 (device catalogue)" } });
  if (!res.ok) throw new Error("Wikipedia responded " + res.status);
  const j = await res.json();
  return Object.values(j?.query?.pages || {});
}

const GENERIC = /^(History of|List of|Comparison of|Outline of|Glossary of|Timeline of|Category:|Portal:)/i;

export async function syncDevices() {
  if (!hasDatabase()) return { synced: 0, note: "database offline" };
  // The catalogue is fully auto-generated, so clear the previous snapshot before refilling
  // (this also removes generic encyclopedia articles cloned by older search terms).
  try { await q("DELETE FROM devices"); } catch (e) { console.warn("[devices] purge failed:", e?.message); }
  let synced = 0;
  for (const [category, term] of CATEGORIES) {
    try {
      const pages = await wikiSearch(term);
      for (const p of pages) {
        const name = String(p.title || "").trim();
        if (!name || GENERIC.test(name)) continue;
        const image = p.thumbnail?.source || null;
        const summary = String(p.extract || "").replace(/\s+/g, " ").slice(0, 420);
        if (!summary) continue;
        const brand = name.split(" ")[0];
        const source = `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`;
        await q(
          `INSERT INTO devices (name, brand, category, image_url, summary, source_url, source_name, fetched_at)
           VALUES ($1,$2,$3,$4,$5,$6,'Wikipedia',$7)
           ON CONFLICT (name) DO UPDATE SET image_url=COALESCE(EXCLUDED.image_url, devices.image_url),
             summary=EXCLUDED.summary, source_url=EXCLUDED.source_url, category=EXCLUDED.category, fetched_at=NOW()`,
          [name, brand, category, image, summary, source, new Date()]
        );
        synced++;
      }
    } catch (e) {
      console.warn("[devices]", term, e?.message || e);
    }
  }
  return { synced };
}

r.get("/devices", wrap(async (_req, res) => {
  if (!hasDatabase()) return ok(res, { items: [], categories: [] });
  const rows = (await q("SELECT id, name, brand, category, image_url, summary, source_url, source_name, fetched_at FROM devices ORDER BY category, name LIMIT 400")).rows;
  const categories = [...new Set(rows.map((x) => x.category))];
  return ok(res, { items: rows, categories });
}));

r.post("/admin/devices/refresh", auth, adminOnly, wrap(async (_req, res) => {
  const out = await syncDevices();
  return ok(res, out);
}));

r.delete("/admin/devices/:id", auth, adminOnly, wrap(async (req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "Database offline" });
  await q("DELETE FROM devices WHERE id=$1", [req.params.id]);
  return ok(res, { deleted: true });
}));

/* ---------- Opportunities board (admin-managed) ---------- */
r.get("/jobs", wrap(async (_req, res) => {
  if (!hasDatabase()) return ok(res, []);
  const rows = (await q("SELECT id, title, org, kind, region, url, deadline, created_at FROM jobs ORDER BY created_at DESC LIMIT 200")).rows;
  return ok(res, rows);
}));

r.post("/admin/jobs", auth, adminOnly, wrap(async (req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "Database offline" });
  const b = req.body || {};
  const title = String(b.title || "").trim().slice(0, 160);
  if (!title) return res.status(400).json({ ok: false, error: "A title is required" });
  const row = (await q(
    "INSERT INTO jobs (title, org, kind, region, url, deadline) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
    [title, String(b.org || "").slice(0, 120), String(b.kind || "Program").slice(0, 40), String(b.region || "Africa").slice(0, 60), String(b.url || "").slice(0, 400), b.deadline || null]
  )).rows[0];
  return ok(res, row);
}));

r.delete("/admin/jobs/:id", auth, adminOnly, wrap(async (req, res) => {
  if (!hasDatabase()) return res.status(503).json({ ok: false, error: "Database offline" });
  await q("DELETE FROM jobs WHERE id=$1", [req.params.id]);
  return ok(res, { deleted: true });
}));

export default r;
