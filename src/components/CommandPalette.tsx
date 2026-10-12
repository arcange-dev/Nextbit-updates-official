import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft } from "lucide-react";
import { api } from "../api";

export type NavItem = { id: string; label: string; hint: string; run: () => void };
type Item = { id: string; label: string; hint: string; group: "Navigate" | "Stories" | "AI Tools"; run: () => void };

// Command Palette — Ctrl+K / Cmd+K global navigation + deep search.
// Zero dependencies: custom arrow-key/Enter/Escape keyboard handling.
// Stories and AI tools are fetched lazily on first open to keep the index fresh.
export default function CommandPalette({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [extra, setExtra] = useState<Item[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ(""); setSel(0);
    setTimeout(() => inputRef.current?.focus(), 10);
    if (loaded.current) return;
    loaded.current = true;
    Promise.all([api.articles().catch(() => []), api.tools().catch(() => [])]).then(([arts, tools]: any[]) => {
      setExtra([
        ...(arts || []).slice(0, 20).map((a: any) => ({
          id: `story-${a.id}`, label: a.title, hint: a.category || "Story", group: "Stories" as const,
          run: () => { location.hash = `#/article/${a.id}`; },
        })),
        ...(tools || []).slice(0, 30).map((t: any) => ({
          id: `tool-${t.id}`, label: t.name, hint: t.category, group: "AI Tools" as const,
          run: () => { location.hash = "#/directory"; },
        })),
      ]);
    });
  }, [open]);

  const items: Item[] = useMemo(() => {
    const nav = navItems.map((n) => ({ ...n, group: "Navigate" as const }));
    const all = [...nav, ...extra];
    const s = q.toLowerCase().trim();
    const hits = s ? all.filter((i) => (i.label + " " + i.hint).toLowerCase().includes(s)) : all;
    const order = ["Navigate", "Stories", "AI Tools"] as const;
    return order.flatMap((g) => hits.filter((h) => h.group === g));
  }, [navItems, extra, q]);

  useEffect(() => { if (sel >= items.length) setSel(0); }, [items.length, sel]);

  if (!open) return null;

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Command palette"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 pt-[12vh] backdrop-blur-sm"
    >
      <div className="w-[min(92vw,36rem)] overflow-hidden rounded-2xl border border-line bg-card shadow-2xl glow-cyber">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={15} className="text-neon" aria-hidden />
          <input
            ref={inputRef} value={q} aria-label="Search the platform"
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            placeholder="Search stories, tools, pages…"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === "Enter" && items[sel]) { setOpen(false); items[sel].run(); }
            }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">ESC</kbd>
        </div>
        <ul role="listbox" className="max-h-80 overflow-y-auto p-2">
          {items.map((r, i) => (
            <li
              key={r.id} role="option" aria-selected={i === sel}
              onMouseEnter={() => setSel(i)}
              onClick={() => { setOpen(false); r.run(); }}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${i === sel ? "bg-neon/10" : ""}`}
            >
              <span className={`font-mono text-[9px] font-semibold uppercase tracking-[.15em] ${
                r.group === "Stories" ? "text-cyber" : r.group === "AI Tools" ? "text-plasma" : "text-zinc-600"}`}>{r.group}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{r.label}</span>
              <span className="max-w-28 truncate text-[11px] text-zinc-600">{r.hint}</span>
              {i === sel && <CornerDownLeft size={13} className="shrink-0 text-neon" aria-hidden />}
            </li>
          ))}
          {!items.length && <li className="px-3 py-6 text-center text-sm text-zinc-600">No results for "{q}"</li>}
        </ul>
        <div className="border-t border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[.2em] text-zinc-600">↑↓ navigate · ↵ open · esc close</div>
      </div>
    </div>
  );
}
