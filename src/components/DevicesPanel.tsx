import { useEffect, useState } from "react";
import { ArrowUpRight, Cpu, RefreshCw } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../lib/auth";

// Devices catalogue: automatically cloned from Wikipedia/Wikimedia on a weekly
// schedule (images, summaries and source links included). Admin can sync on demand.
export default function DevicesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const auth = useAuth();

  const load = () => {
    setLoading(true);
    api.devices()
      .then((d: any) => { setItems(d?.items || []); setCategories(d?.categories || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const sync = async () => {
    if (!auth?.token) return;
    setBusy(true); setNote("");
    try {
      const out: any = await api.refreshDevices(auth.token);
      setNote("Synced " + (out?.synced ?? 0) + " devices from the web.");
      load();
    } catch (e: any) { setNote(e?.message || "Sync failed."); }
    setBusy(false);
  };

  const list = items.filter((d) => cat === "All" || d.category === cat);

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-32 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[.25em] text-orange">Device intelligence</div>
          <h1 className="mt-2 font-display text-5xl font-bold">Electronic devices</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Phones, computers, TVs, tablets, wearables, audio and consoles. Images, specs and summaries are cloned
            automatically from the web (Wikipedia &amp; Wikimedia, attributed) and refreshed every week.
          </p>
        </div>
        {auth?.user?.role === "admin" && (
          <button onClick={sync} disabled={busy} className="liquid-button ghost flex items-center gap-2 px-5 py-3 text-sm disabled:opacity-50">
            <RefreshCw size={14} className={busy ? "animate-spin" : ""} /> {busy ? "Syncing…" : "Sync devices now"}
          </button>
        )}
      </div>
      {note && <p className="mt-3 text-sm text-zinc-400">{note}</p>}

      <div className="mt-8 flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (cat === c ? "bg-orange text-black" : "bg-white/5 text-zinc-400 hover:text-white")}>
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card h-64 animate-pulse" />)}
        </div>
      )}

      {!loading && !list.length && (
        <div className="glass-card mt-8 p-8 text-sm text-zinc-500">
          No devices yet. The catalogue fills automatically — the first weekly sync has probably not finished. Ask the admin to press “Sync devices now”.
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <div key={d.id} className="glass-card group overflow-hidden">
            {d.image_url
              ? <img src={d.image_url} alt={d.name} loading="lazy" className="h-44 w-full bg-zinc-100 object-contain p-3 transition duration-500 group-hover:scale-[1.03]" />
              : <div className="grid h-44 place-items-center bg-zinc-100"><Cpu className="text-zinc-400" size={32} /></div>}
            <div className="p-5">
              <div className="flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[.15em]">
                <span className="text-orange">{d.category}</span>
                {d.brand && <span className="text-zinc-500">· {d.brand}</span>}
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold">{d.name}</h3>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-500">{d.summary}</p>
              {d.source_url && (
                <a href={d.source_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs text-orange hover:underline">
                  Specs &amp; source ({d.source_name || "Wikipedia"}) <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
