import { useEffect, useState } from "react";
import { Star, TrendingUp } from "lucide-react";
import { api } from "../api";

type Repo = { name: string; description: string; stars: number; url: string };

// GitHub Trend Widget — sidebar list of repos created in the last 7 days,
// ranked by stars. Data: GET /api/trends (server-side GitHub Search API, 5min cache).
export default function GithubTrends() {
  const [repos, setRepos] = useState<Repo[]>([]);
  useEffect(() => { api.trends().then(setRepos as any).catch(() => {}); }, []);

  return (
    <aside aria-label="Trending on GitHub" className="glass-card p-5">
      <h2 className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.25em] text-zinc-400">
        <TrendingUp size={13} className="text-plasma" aria-hidden /> GitHub Trending
      </h2>
      <ol className="mt-4 grid gap-1">
        {repos.map((r, i) => (
          <li key={r.name}>
            <a href={r.url} target="_blank" rel="noopener noreferrer"
               className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[.03]">
              <span className="mt-0.5 font-mono text-[10px] text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-neon">{r.name}</span>
                <span className="block truncate text-[11px] text-zinc-600">{r.description || "No description"}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[11px] text-plasma">
                <Star size={11} aria-hidden /> {r.stars.toLocaleString()}
              </span>
            </a>
          </li>
        ))}
        {!repos.length && <li className="px-2 py-2 text-xs text-zinc-600">Loading trending repos…</li>}
      </ol>
    </aside>
  );
}
