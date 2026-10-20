import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { api } from "../api";

type S = { id: string; label: string; status: string; description: string };
const LOOK: Record<string, { dot: string; label: string; text: string }> = {
  none:        { dot: "bg-neon",       label: "Operational",  text: "text-neon" },
  minor:       { dot: "bg-amber-400",  label: "Minor outage", text: "text-amber-400" },
  major:       { dot: "bg-zinc-400", label: "Major outage", text: "text-zinc-300" },
  critical:    { dot: "bg-red-500",    label: "Critical",    text: "text-red-400" },
  maintenance: { dot: "bg-cyber",      label: "Maintenance", text: "text-cyber" },
  unknown:     { dot: "bg-zinc-600",   label: "No data",    text: "text-zinc-600" },
};

// Global Outage Status Tracker — aggregated server-side from official status
// pages (GET /api/status, cached 60s both ends). Auto-refreshes every minute.
export default function StatusBoard() {
  const [rows, setRows] = useState<S[]>([]);
  useEffect(() => {
    const load = () => api.status().then(setRows as any).catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <section aria-label="Global service status" className="glass-card p-5">
      <h2 className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.25em] text-zinc-400">
        <Activity size={13} className="text-neon" aria-hidden /> Global Status
      </h2>
      <ul className="mt-4 grid gap-2">
        {rows.map((s) => {
          const v = LOOK[s.status] ?? LOOK.unknown;
          return (
            <li key={s.id} className="flex items-center gap-3 rounded-lg border border-line/60 bg-black/25 px-3 py-2">
              <span className={`size-2.5 rounded-full ${v.dot} ${s.status === "none" ? "animate-pulse" : ""}`} aria-hidden />
              <span className="text-sm font-medium">{s.label}</span>
              <span className={`ml-auto text-[11px] font-medium ${v.text}`}>{v.label}</span>
            </li>
          );
        })}
        {!rows.length && <li className="text-xs text-zinc-600">Loading status feeds…</li>}
      </ul>
    </section>
  );
}
