import { useEffect, useState } from "react";
import { Activity, ChevronDown, RefreshCw } from "lucide-react";
import { api } from "../api";

// Footer market panel: all famous ICT companies with live Yahoo Finance rates.
// Collapsed by default; visitors click to open the full board. Auto-refreshes.
export default function FooterMarket() {
  const [open, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = () => {
    setBusy(true);
    api.quotes()
      .then((d: any) => { setQuotes(d || []); setUpdatedAt(new Date()); })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    if (!open || quotes.length) return;
    load();
    // eslint-disable-next-line
  }, [open]);

  useEffect(() => {
    const t = setInterval(() => { if (open) load(); }, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [open]);

  const up = quotes.filter((q: any) => q.changePct >= 0).length;

  return (
    <div className="mx-auto mb-10 max-w-[1440px] border border-line rounded-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.25em] text-orange">
          <Activity size={12} aria-hidden /> Market
          <span className="hidden text-zinc-500 sm:inline">— live rates of the world's ICT companies</span>
        </span>
        <span className="flex items-center gap-3 text-xs text-zinc-500">
          {quotes.length > 0 && (
            <span>
              {quotes.length} companies · <span className="text-emerald-400">{up} up</span> · <span className="text-red-400">{quotes.length - up} down</span>
            </span>
          )}
          <ChevronDown size={16} className={"transition-transform " + (open ? "rotate-180" : "")} aria-hidden />
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-5 py-4">
          {!quotes.length && !busy && (
            <p className="text-sm text-zinc-500">Live market rates are unavailable right now.</p>
          )}
          {busy && !quotes.length && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-black/30" />)}</div>
          )}
          {quotes.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {quotes.map((q: any) => (
                  <div key={q.symbol} className="rounded-xl border border-line p-3">
                    <div className="font-mono text-[10px] font-bold tracking-widest">{q.symbol}</div>
                    <div className="mt-1 text-sm text-zinc-400">${Number(q.price).toLocaleString()}</div>
                    <div className={"text-xs " + (q.changePct >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {q.changePct >= 0 ? "▲" : "▼"} {Math.abs(q.changePct)}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-600">
                <span>{updatedAt ? "Updated " + updatedAt.toLocaleTimeString() : ""} · auto-refreshes every 5 minutes · Yahoo Finance</span>
                <button onClick={load} disabled={busy} className="flex items-center gap-1 hover:text-white disabled:opacity-40">
                  <RefreshCw size={12} className={busy ? "animate-spin" : ""} aria-hidden /> Refresh
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
