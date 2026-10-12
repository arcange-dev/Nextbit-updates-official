import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Rocket, Users, Mic, MapPin } from "lucide-react";
import { api } from "../api";

type Ev = { id: string; title: string; kind: string; starts_at: string; url: string | null; location: string | null };
const KIND_ICON: Record<string, any> = { Hackathon: Users, Release: Rocket, Conference: MapPin, Webinar: Mic };

// Tech Event Calendar — mini month grid + upcoming timeline.
// Data: GET /api/events (Postgres events table). Days with events get a purple dot.
export default function EventCalendar() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  useEffect(() => { api.events().then(setEvents as any).catch(() => {}); }, []);

  const grid = useMemo(() => {
    const startDow = month.getDay();
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const byDay = new Map<number, Ev[]>();
    events.forEach((e) => {
      const d = new Date(e.starts_at);
      if (d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear())
        byDay.set(d.getDate(), [...(byDay.get(d.getDate()) || []), e]);
    });
    return { blanks: Array(startDow).fill(null), days, byDay };
  }, [month, events]);

  const upcoming = events.slice(0, 5);
  const today = new Date();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.25em] text-zinc-400">
            <CalendarDays size={13} className="text-plasma" aria-hidden />
            {month.toLocaleString("en", { month: "long", year: "numeric" })}
          </h3>
          <span className="flex gap-1">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="rounded border border-line px-2 py-0.5 text-xs text-zinc-500 hover:text-plasma">‹</button>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="rounded border border-line px-2 py-0.5 text-xs text-zinc-500 hover:text-plasma">›</button>
          </span>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="py-1 font-mono text-[9px] font-bold uppercase text-zinc-600">{d}</span>)}
          {grid.blanks.map((_, i) => <span key={`b${i}`} />)}
          {Array.from({ length: grid.days }, (_, i) => i + 1).map((d) => {
            const has = grid.byDay.has(d);
            const isToday = d === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear();
            return (
              <span key={d} title={has ? grid.byDay.get(d)!.map((e) => e.title).join(", ") : undefined}
                className={`flex size-7 items-center justify-center rounded font-mono text-[11px] ${
                  isToday ? "bg-neon font-bold text-black glow-neon" : has ? "bg-plasma/20 font-semibold text-plasma" : "text-zinc-600"
                }`}>
                {d}
              </span>
            );
          })}
        </div>
      </div>

      <ol className="glass-card relative grid content-start gap-4 p-5 before:absolute before:inset-y-8 before:left-[37px] before:w-px before:bg-line">
        {upcoming.map((e) => {
          const Icon = KIND_ICON[e.kind] || Rocket;
          const d = new Date(e.starts_at);
          return (
            <li key={e.id} className="relative flex items-center gap-4">
              <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-black/40 text-neon">
                <Icon size={15} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium hover:text-neon">{e.title}</a>
                ) : (
                  <span className="block truncate text-sm font-medium">{e.title}</span>
                )}
                <span className="text-[11px] text-zinc-600">
                  {d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })} · {e.kind}{e.location ? ` · ${e.location}` : ""}
                </span>
              </span>
            </li>
          );
        })}
        {!upcoming.length && <li className="text-xs text-zinc-600">No upcoming events tracked yet.</li>}
      </ol>
    </div>
  );
}
