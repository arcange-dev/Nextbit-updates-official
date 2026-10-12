import { useEffect, useMemo, useState } from "react";
import { Search, ExternalLink, LayoutGrid } from "lucide-react";
import { api } from "../api";
import UpvoteButton from "./UpvoteButton";

type Tool = { id: string; name: string; category: string; description: string; url: string; tags: string[]; votes: number };

// Live AI Directory — filterable, searchable grid of AI tools with votes.
// Data: GET /api/tools (Postgres ai_tools table + live vote sums). 60s client cache.
let cache: { at: number; rows: Tool[]; mine: Record<string, number> } | null = null;

export default function AIDirectory() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [mine, setMine] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (cache && Date.now() - cache.at < 60_000) {
      setTools(cache.rows); setMine(cache.mine); setLoading(false); return;
    }
    Promise.all([api.tools(), api.votes("tool", [], "")].catch(() => [[], {}]))
      .then(([rowsRaw]: any[]) => {
        if (!active) return;
        const rows = rowsRaw as Tool[];
        cache = { at: Date.now(), rows, mine: {} };
        setTools(rows); setMine({}); setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(tools.map((t) => t.category))).sort()], [tools]);
  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return tools.filter((t) =>
      (cat === "All" || t.category === cat) &&
      (!s || (t.name + " " + t.description + " " + (t.tags || []).join(" ")).toLowerCase().includes(s))
    );
  }, [tools, q, cat]);

  return (
    <section aria-label="Live AI directory" className="glass-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <LayoutGrid size={18} className="text-neon" aria-hidden /> Live AI Directory
        </h2>
        <div className="relative sm:ml-auto sm:w-64">
          <Search size={14} className="absolute left-3 top-3 text-zinc-600" aria-hidden />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools…" aria-label="Search AI tools"
            className="w-full rounded-lg border border-line bg-black/30 py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-zinc-600 focus:border-neon/50"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist">
        {cats.map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              cat === c ? "bg-neon text-black glow-neon" : "border border-line text-zinc-500 hover:text-zinc-200"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-40 animate-pulse rounded-xl border border-line" />)}</div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <article key={t.id} className="glass group rounded-xl border border-line p-4 transition-all hover:-translate-y-0.5 hover:border-neon/40">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold group-hover:text-neon">{t.name}</h3>
                <UpvoteButton targetId={t.id} kind="tool" initialCount={t.votes} initialMine={mine[t.id] || 0} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{t.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded bg-cyber/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[.15em] text-cyber">{t.category}</span>
                <a href={t.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${t.name}`}
                   className="flex items-center gap-1 text-[11px] text-neon opacity-60 transition-opacity hover:opacity-100">
                  Visit <ExternalLink size={11} aria-hidden />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !filtered.length && <p className="mt-8 text-center text-sm text-zinc-600">No tools match that search.</p>}
    </section>
  );
}
