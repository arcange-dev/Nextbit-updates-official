import { useEffect, useState } from "react";
import { ExternalLink, GitBranch, Star, TrendingUp } from "lucide-react";
import { api } from "../api";

type Repo = { name: string; description: string; stars: number; language: string; url: string; pushedAt: string };

// Trending GitHub repos across every technology field.
// Data: GET /api/trends/field/:field (server-side GitHub Search API, 10-min cache).
const FIELDS = [
  { id: "all", label: "All fields" },
  { id: "ai", label: "AI & ML" },
  { id: "web", label: "Web" },
  { id: "security", label: "Security" },
  { id: "systems", label: "Systems" },
  { id: "data", label: "Data" },
  { id: "iot", label: "IoT & Hardware" },
  { id: "mobile", label: "Mobile" },
  { id: "devops", label: "DevOps" },
];

export default function TrendingRepos() {
  const [field, setField] = useState("all");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setErr(""); setRepos([]);
    api.trendsField(field)
      .then((d: any) => active && setRepos(d || []))
      .catch((e: Error) => active && setErr(e.message || "GitHub trending unavailable."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [field]);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Technology fields">
        {FIELDS.map((f) => (
          <button key={f.id} role="tab" aria-selected={field === f.id} onClick={() => setField(f.id)}
            className={`border px-4 py-2 text-sm transition ${field === f.id ? "border-orange bg-orange font-semibold text-black" : "border-line text-zinc-400 hover:text-white"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="glass-card h-28 animate-pulse" />)}</div>
      ) : err ? (
        <p role="alert" className="mt-6 text-sm text-zinc-500">{err}</p>
      ) : (
        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {repos.map((r, i) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="glass-card group flex h-full flex-col gap-2 p-5 transition hover:border-orange/40">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate font-display text-lg font-semibold group-hover:text-orange-2">{r.name}</span>
                  <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-plasma"><Star size={12} aria-hidden /> {r.stars.toLocaleString()}</span>
                </div>
                <p className="line-clamp-2 text-[13px] leading-5 text-zinc-500">{r.description || "No description"}</p>
                <div className="mt-auto flex items-center gap-4 text-[11px] text-zinc-600">
                  {r.language && <span className="flex items-center gap-1"><GitBranch size={11} aria-hidden /> {r.language}</span>}
                  <span>Updated {new Date(r.pushedAt).toLocaleDateString()}</span>
                  <ExternalLink size={12} className="ml-auto text-orange" aria-hidden />
                </div>
              </a>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-zinc-600">
        <TrendingUp size={12} className="text-orange" aria-hidden /> GitHub Search API · repos updated in the last 90 days · cached 10 min
      </p>
    </div>
  );
}
