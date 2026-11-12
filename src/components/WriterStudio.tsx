import { useEffect, useState } from "react";
import { PenLine, Upload } from "lucide-react";
import { api } from "../api";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

// News writer studio: writers sign in with credentials created by the admin and
// can write, upload images and publish their own stories. No other admin access.
export default function WriterStudio({ token, user, onSignOut }: { token: string; user: any; onSignOut: () => void }) {
  const [form, setForm] = useState({ title: "", slug: "", category: "AI", summary: "", body: "", image_url: "" });
  const [mine, setMine] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = () => api.writerArticles(token).then((d: any) => setMine(d || [])).catch(() => {});
  useEffect(() => { load(); }, [token]);

  const save = async (status: "draft" | "published") => {
    if (!form.title.trim() || !form.summary.trim()) { setMsg("A title and summary are required."); return; }
    setBusy(true); setMsg("");
    try {
      await api.createArticle(token, {
        ...form,
        slug: form.slug || slugify(form.title),
        author: user?.name || "NextBit Writer",
        status,
        verified: false,
      });
      setMsg(status === "published" ? "Published! Your story is live on the site." : "Draft saved.");
      setForm({ title: "", slug: "", category: "AI", summary: "", body: "", image_url: "" });
      load();
    } catch (e: any) { setMsg(e?.message || "Could not save."); }
    setBusy(false);
  };

  const upload = async (f: File | null) => {
    if (!f || !token) return;
    setUploading(true); setMsg("");
    try {
      const d: any = await api.uploadImage(token, f);
      setForm((prev) => ({ ...prev, image_url: d?.url || "" }));
      setMsg("Image uploaded and attached.");
    } catch (e: any) { setMsg(e?.message || "Upload failed."); }
    setUploading(false);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-24 pt-32 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[.25em] text-orange">News writer studio</div>
          <h1 className="mt-2 font-display text-4xl font-bold">Hello, {user?.name || "writer"}</h1>
          <p className="mt-2 text-sm text-zinc-500">Write and publish stories under your own name. The editor signs every story with your byline.</p>
        </div>
        <button onClick={onSignOut} className="liquid-button ghost px-4 py-2 text-sm">Sign out</button>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 font-mono text-[9px] text-orange"><PenLine size={12} /> NEW STORY</div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Headline" className="mt-4 w-full border-b border-line bg-transparent py-4 font-display text-3xl font-bold outline-none" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Category (AI, Robotics…)" className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-orange/50" />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="slug (auto if empty)" className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-orange/50" />
          </div>
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Summary / dek" className="mt-3 min-h-24 w-full rounded-xl border border-line bg-white p-4 text-sm outline-none focus:border-orange/50" />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Write the full story…" className="mt-3 min-h-[320px] w-full rounded-xl border border-line bg-white p-4 text-sm leading-7 outline-none focus:border-orange/50" />
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="Cover image URL" className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-orange/50" />
            <label className="liquid-button ghost flex cursor-pointer items-center justify-center gap-2 px-4 py-3 text-sm">
              <Upload size={14} /> {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => save("published")} disabled={busy} className="liquid-button px-6 py-3 text-sm disabled:opacity-50">Publish</button>
            <button onClick={() => save("draft")} disabled={busy} className="liquid-button ghost px-6 py-3 text-sm disabled:opacity-50">Save draft</button>
          </div>
          {msg && <p className="mt-3 text-sm text-zinc-600">{msg}</p>}
        </div>

        <div className="glass-card h-fit p-6">
          <div className="font-mono text-[9px] text-orange">MY STORIES</div>
          {!mine.length && <p className="mt-3 text-sm text-zinc-500">No stories yet.</p>}
          <div className="mt-3 grid gap-2">
            {mine.map((a) => (
              <div key={a.id} className="rounded-xl border border-line p-3">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">{a.category} · {a.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
