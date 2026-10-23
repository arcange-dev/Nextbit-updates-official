import { useEffect, useState } from "react";
import { Activity, X } from "lucide-react";
import { api } from "../api";

// Tech market ticker: the world's famous ICT companies via /api/quotes
// (AAPL, MSFT, GOOGL, NVDA, META, AMZN, ORCL, ADBE, CRM, AMD, QCOM, AVGO, TSM, ASML, ARM, IBM, INTC)
// Yahoo Finance chart data, auto-refreshed every 5 min client-side, 10-min server cache. Remembers the hidden state.
export default function FinTicker() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [open, setOpen] = useState(() => localStorage.getItem("nb_ticker") !== "off");
  useEffect(() => {
    const load = () => api.quotes().then((d: any) => setQuotes(d || [])).catch(() => {});
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);
  if (!open || !quotes.length) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur" role="region" aria-label="Tech market ticker">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-5 py-2 lg:px-10">
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[9px] uppercase tracking-[.2em] text-orange"><Activity size={11} aria-hidden /> Markets</span>
        {quotes.map((q: any) => (
          <span key={q.symbol} className="flex shrink-0 items-baseline gap-1.5 font-mono text-xs">
            <b>{q.symbol}</b>
            <span className="text-zinc-400">${Number(q.price).toLocaleString()}</span>
            <span className={q.changePct >= 0 ? "text-emerald-400" : "text-red-400"}>{q.changePct >= 0 ? "▲" : "▼"} {Math.abs(q.changePct)}%</span>
          </span>
        ))}
        <button onClick={() => { setOpen(false); localStorage.setItem("nb_ticker", "off"); }} className="ml-auto shrink-0 text-zinc-500 hover:text-white" aria-label="Hide market ticker"><X size={14} /></button>
      </div>
    </div>
  );
}
