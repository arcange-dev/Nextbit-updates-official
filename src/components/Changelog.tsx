import { useCallback, useEffect, useState } from "react";
import { GitCommitHorizontal, RefreshCw } from "lucide-react";
import { api } from "../api";

// Automated changelog dashboard: latest releases per major tech stack, proxied
// through /api/changelog (GitHub releases API, 30-minute server cache).
const STACKS = [
  { name: "React", repo: "facebook/react" },
  { name: "Node.js", repo: "nodejs/node" },
  { name: "Python", repo: "python/cpython" },
  { name: "Tailwind CSS", repo: "tailwindlabs/tailwindcss" },
  { name: "OpenAI SDK", repo: "openai/openai-python" },
  { name: "Vite", repo: "vitejs/vite" },
];

export default function Changelog() {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    setBusy(true);
    Promise.all(STACKS.map((s) => api.changelog(s.repo).then((d: any) => [s.name, d || []]).catch(() => [s.name, []])))
      .then((pairs) => setData(Object.fromEntries(pairs)))
      .finally(() => setBusy(false));
  }, []);
  useEffect(load, [load]);
  return (
    <div>
      <div className="flex items-center">
        <p className="max-w-2xl text-sm text-zinc-500">Latest version releases and patch notes for the stacks that matter, pulled live from upstream repositories and cached server-side.</p>
        <button onClick={load} className="ml-auto flex shrink-0 items-center gap-1.5 border border-line px-4 py-2 text-xs hover:border-orange" aria-label="Refresh changelog"><RefreshCw size={13} aria-hidden /> Refresh</button>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {STACKS.map((s) => (
          <section key={s.name} className="glass-card p-6" aria-label={s.name + " releases"}>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.25em] text-orange"><GitCommitHorizontal size={13} aria-hidden /> {s.name}</div>
            {!data[s.name] ? (
              <div className="mt-4 grid gap-2">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-12" />)}</div>
            ) : data[s.name].length ? (
              <ol className="mt-4 divide-y divide-line">
                {data[s.name].slice(0, 4).map((rel: any, i: number) => (
                  <li key={i} className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-orange/40 bg-orange/10 px-2 py-0.5 font-mono text-[10px] text-orange">{String(rel.tag || rel.name || "—").slice(0, 18)}</span>
                      {rel.date && <time className="ml-auto text-[10px] text-zinc-600">{new Date(rel.date).toLocaleDateString()}</time>}
                    </div>
                    {rel.notes && <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">{rel.notes}</p>}
                  </li>
                ))}
              </ol>
            ) : <p className="mt-4 text-sm text-zinc-600">{busy ? "Loading…" : "No releases found."}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
