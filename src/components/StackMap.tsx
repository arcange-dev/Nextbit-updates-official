import { Boxes } from "lucide-react";

// Tech stack visualizer: the architecture powering NextBit Updates, rendered
// as an infographic grid — frontend, backend, data and AI/signal layers.
const LAYERS = [
  { title: "Frontend", note: "Zero-bloat single-page app, hash routing, no heavy UI frameworks.", items: ["React 19", "TypeScript 5", "Vite 8", "Tailwind CSS v4", "Lucide icons", "CSS-variable theming"] },
  { title: "Backend", note: "One Node process serves the JSON API and the built frontend.", items: ["Express 5", "Node 20", "Zod validation", "JWT sessions", "Helmet + rate limiting"] },
  { title: "Data", note: "Relational core with trigram search; entity-style REST layer.", items: ["PostgreSQL", "pg_trgm search", "Categories & tags", "Comments & bookmarks", "Job board tables"] },
  { title: "AI & signals", note: "Live intelligence fetched server-side and cached 10–30 minutes.", items: ["llm-stats mirror (408 models)", "GitHub trending radar", "GitHub releases radar", "Yahoo market quotes", "OpenGraph share cards"] },
];

export default function StackMap() {
  return (
    <section aria-label="Platform tech stack">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.25em] text-orange"><Boxes size={14} aria-hidden /> How NextBit is built</div>
      <h2 className="mt-2 font-display text-3xl font-bold">The stack behind the platform</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {LAYERS.map((l, i) => (
          <article key={l.title} className="glass-card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-orange/40 bg-orange/10 font-mono text-xs text-orange">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-xl font-semibold">{l.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-500">{l.note}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {l.items.map((t) => <span key={t} className="border border-line bg-black/30 px-3 py-1.5 font-mono text-[11px] text-zinc-300">{t}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
