// Extracted from App.tsx during the admin panel restructure (phase 2).
// Same JSX as before; the Admin shell passes all state and handlers as props.

import { AdminOfflineNote, LiquidButton } from "../../App";
type ArticleForm = any;

import { useState } from "react";
import { api } from "../../api";

export default function EditorTab(props: any) {
  const { databaseStatus, editing, form, save, setForm, setTab, token } = props;
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const onFile = (f: File | null) => {
    if (!f) return;
    if (!token) { setUploadMsg("Your session expired — sign out and sign in again, then retry the upload."); return; }
    if (f.size === 0) { setUploadMsg("That file is empty (0 bytes). If it lives in OneDrive or a cloud folder, download it to your computer first, then upload again."); return; }
    if (f.size > 10 * 1024 * 1024) { setUploadMsg("Images must be 10 MB or smaller."); return; }
    setUploading(true); setUploadMsg("");
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = String(fr.result || "");
      const b64 = dataUrl.split(",")[1] || "";
      if (!b64 || b64.length < 32) { setUploading(false); setUploadMsg("Could not read that file (it looks empty or unreadable). Save the image to your computer (not a cloud folder) and upload again."); return; }
      api.uploadImage(token, { name: f.name, mime: f.type && f.type.startsWith("image/") ? f.type : "image/png", data: b64 })
        .then((d: any) => { setForm({ ...form, image_url: d?.url || "" }); setUploadMsg("Image uploaded and attached to this story."); })
        .catch((err: any) => setUploadMsg(err?.message || "Upload failed."))
        .finally(() => setUploading(false));
    };
    fr.onerror = () => { setUploadMsg("Could not read that file."); setUploading(false); };
    fr.readAsDataURL(f);
  };
  return (
<form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_340px]">{databaseStatus!=="ok"&&<div className="lg:col-span-2"><AdminOfflineNote text="Publishing will not succeed until Supabase is restored. Keep writing — your draft autosaves locally in this browser, so you can publish later in one click."/></div>}<div className="glass-card p-7"><div className="mb-5 flex items-center justify-between"><div><div className="font-mono text-[9px] text-orange">EDITORIAL STUDIO</div><div className="mt-1 font-display text-2xl font-bold">{editing?"Edit article":"Compose story"}</div></div><span className="rounded-full border border-line px-3 py-2 text-[10px] text-zinc-500">Autosave-ready UI</span></div><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border-b border-line bg-transparent py-5 font-display text-4xl font-bold outline-none" placeholder="Headline"/><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="border border-line bg-black/30 p-3 outline-none" placeholder="slug"/><input required value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="border border-line bg-black/30 p-3 outline-none" placeholder="category"/></div><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} className="mt-3 w-full border border-line bg-black/30 p-3 outline-none" placeholder="tags: ai, security, africa (comma separated)"/><textarea required value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} className="mt-3 min-h-28 w-full border border-line bg-black/30 p-4 outline-none" placeholder="Summary / dek"/><textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} className="mt-3 min-h-[420px] w-full border border-line bg-black/30 p-4 leading-7 outline-none" placeholder="Write the full technology story…"/><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="grid gap-2"><input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} className="border border-line bg-black/30 p-3 outline-none" placeholder="Image URL"/><div className="flex flex-wrap items-center gap-2"><label className="liquid-button ghost cursor-pointer px-4 py-2 text-xs">{uploading?"Uploading…":"Upload image"}<input type="file" accept="image/*" className="hidden" onChange={e=>{onFile(e.target.files?.[0]||null);e.currentTarget.value=""}}/></label><span className="text-[11px] leading-4 text-zinc-600">Any image format (PNG, JPEG, WebP, GIF, SVG, AVIF, BMP, TIFF…) · up to 10 MB</span></div>{uploading&&<div className="h-32 w-full animate-pulse rounded-xl border border-line bg-black/40"/>}{!uploading&&form.image_url&&<div className="relative overflow-hidden rounded-xl border border-line"><img src={form.image_url} alt="Cover image preview" className="h-32 w-full object-cover"/>{uploadMsg&&<span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-[10px] text-emerald-400">{uploadMsg}</span>}<button type="button" onClick={()=>setForm({...form,image_url:""})} className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs hover:bg-black" aria-label="Remove cover image">Remove</button></div>}{!uploading&&!form.image_url&&uploadMsg&&<p className="text-xs text-amber-300">{uploadMsg}</p>}</div><input value={form.source_url} onChange={e=>setForm({...form,source_url:e.target.value})} className="border border-line bg-black/30 p-3 outline-none" placeholder="Source URL"/></div></div><aside className="glass-card h-fit p-6 lg:sticky lg:top-24"><div className="font-mono text-[9px] text-orange">PUBLISHING</div><label className="mt-5 block text-xs text-zinc-500">Author<input value={form.author} onChange={e=>setForm({...form,author:e.target.value})} className="mt-2 w-full border border-line bg-black/30 p-3 outline-none"/></label><label className="mt-4 block text-xs text-zinc-500">Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as ArticleForm["status"]})} className="mt-2 w-full border border-line bg-black/30 p-3 outline-none"><option value="draft">Draft</option><option value="review">Review</option><option value="fact_check">Fact check</option><option value="verified">Verified</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.verified} onChange={e=>setForm({...form,verified:e.target.checked})}/> Verified source</label><LiquidButton>{editing?"Update article":"Publish / save"}</LiquidButton><button type="button" onClick={()=>setTab("articles")} className="liquid-button ghost mt-2 w-full">Cancel</button></aside></form>
  );
}