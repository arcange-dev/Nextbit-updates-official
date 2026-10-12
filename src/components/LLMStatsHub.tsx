import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, Newspaper } from "lucide-react";
import { api } from "../api";
import UpvoteButton from "./UpvoteButton";

type NewsItem = { id: string; headline: string; url: string; publishedAt: string; source: string };
type Model = {
  id: string; name: string; org: string; releasedAt: string | null; contextWindow: number | null;
  inputPrice: number | null; outputPrice: number | null; throughput: number | null; latencyMs: number | null;
};

const fmtPrice = (p: number | null) => (p == null ? "—" : p >= 1 ? `$${p}` : `$${p}`);
const fmtCtx = (c: number | null) => (c == null ? "—" : c >= 1000000 ? `${(c / 1000000).toFixed(0)}M` : `${Math.round(c / 1000)}K`);
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

// Live clone of llm-stats.com: AI news feed + full model catalogue with pricing and performance.
// Data: GET /api/llmstats/news + /api/llmstats/models (10-minute server cache, graceful offline states).
export default function LLMStatsHub() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [newsErr, setNewsErr] = useState("");
  const [q, setQ] = useState("");
  const [org, setOrg] = useState("All");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api.llmNews().then((d: any) => setNews(d || [])).catch((e: Error) => setNewsErr(e.message || "unavailable"));
    api.llmModels().then((d: any) => setModels(d || [])).catch(() => {});
  }, []);

  const orgs = useMemo(
    () => ["All", ...Array.from(new Set(models.map((m) => m.org))).sort()],
    [models],
  );
  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return models.filter((m) =>
      (org === "All" || m.org === org) && (!s || (m.name + " " + m.org + " " + m.id).toLowerCase().includes(s)),
    );
  }, [models, q, org]);
  const visible = showAll ? filtered : filtered.slice(0, 24);

  return (
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:px-10 xl:grid-cols-[380px_1fr]">
      {/* ---- AI news, cloned live from llm-stats.com/ai-news ---- */}
      <section aria-label="AI news from llm-stats" className="border border-line bg-card p-6">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-orange">
          <Newspaper size={15} aria-hidden /> AI news
        </div>
        <p className="mt-2 text-xs text-mute">Cloned live from llm-stats.com</p>
        {newsErr ? (
          <p role="alert" className="mt-4 text-sm text-mute">{newsErr}</p>
        ) : !news.length ? (
          <div className="mt-4"><div className="skeleton h-16" /><div className="skeleton mt-3 h-16" /><div className="skeleton mt-3 h-16" /></div>
        ) : (
          <ol className="mt-4 divide-y divide-line">
            {news.map((n) => (
              <li key={n.id}>
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-1 py-4">
                  <span className="font-display text-[15px] font-semibold leading-snug transition group-hover:text-orange-2">{n.headline}</span>
                  <span className="flex items-center justify-between text-[11px] text-mute">
                    <span>{n.source}</span>
                    <span className="flex items-center gap-1">{fmtDate(n.publishedAt)} <ArrowUpRight size={12} className="text-orange" aria-hidden /></span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ---- Model catalogue: pricing, context, throughput ---- */}
      <section aria-label="AI models and tools from llm-stats">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <h2 className="font-display text-2xl font-bold">Models & tools <span className="text-mute">({filtered.length})</span></h2>
          <div className="relative sm:ml-auto sm:w-72">
            <Search size={14} className="absolute left-3 top-3 text-zinc-600" aria-hidden />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 400+ models…" aria-label="Search AI models"
              className="w-full rounded-lg border border-line bg-card py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-zinc-600 focus:border-orange" />
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Organizations">
          {orgs.slice(0, 14).map((o) => (
            <button key={o} role="tab" aria-selected={org === o} onClick={() => setOrg(o)}
              className={`shrink-0 border px-4 py-2 text-sm transition ${org === o ? "border-orange bg-orange font-semibold text-black" : "border-line text-mute hover:text-white"}`}>
              {o}
            </button>
          ))}
        </div>

        {!models.length ? (
          <div className="mt-6 grid gap-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-14" />)}</div>
        ) : (
          <div className="mt-6 overflow-x-auto border border-line bg-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-widest text-mute">
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Released</th>
                  <th className="px-4 py-3">Context</th>
                  <th className="px-4 py-3">$/M in</th>
                  <th className="px-4 py-3">$/M out</th>
                  <th className="px-4 py-3">Tok/s</th>
                  <th className="px-4 py-3 text-right">Vote</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr key={m.id} className="border-b border-line/60 transition hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <span className="font-display font-semibold">{m.name}</span>
                      <span className="block text-[11px] text-mute">{m.org}</span>
                    </td>
                    <td className="px-4 py-3 text-mute">{fmtDate(m.releasedAt)}</td>
                    <td className="px-4 py-3 text-mute">{fmtCtx(m.contextWindow)}</td>
                    <td className="px-4 py-3 text-mute">{fmtPrice(m.inputPrice)}</td>
                    <td className="px-4 py-3 text-mute">{fmtPrice(m.outputPrice)}</td>
                    <td className="px-4 py-3 text-mute">{m.throughput ?? "—"}</td>
                    <td className="px-4 py-3 text-right"><UpvoteButton targetId={m.id} kind="tool" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 24 && (
              <button onClick={() => setShowAll((v) => !v)} className="w-full py-3 text-sm text-orange transition hover:bg-orange/5">
                {showAll ? "Show top 24" : `Show all ${filtered.length} models`}
              </button>
            )}
          </div>
        )}
        <p className="mt-3 text-[11px] text-mute">
          Data mirrored from llm-stats.com (ZeroEval leaderboard dataset). Cached 10 minutes server-side.
        </p>
      </section>
    </div>
  );
}
