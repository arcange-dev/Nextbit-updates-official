import { useEffect, useState } from "react";
import { Bookmark, Brain, Lock, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../lib/auth";

const LEVELS = ["Reader", "Explorer", "Builder", "Engineer", "Architect", "AI Guru"];
const BADGES = [
  { name: "First Words", desc: "Posted your first comment", icon: "msg", need: (s: any) => s.comments >= 1 },
  { name: "Conversation Starter", desc: "5+ comments in the community", icon: "msg", need: (s: any) => s.comments >= 5 },
  { name: "Curator", desc: "Saved 3+ articles to bookmarks", icon: "bm", need: (s: any) => s.bookmarks >= 3 },
  { name: "Quiz Rookie", desc: "Earned 50 XP from knowledge checks", icon: "zap", need: (s: any) => s.xp >= 50 },
  { name: "Verified Mind", desc: "Reader account in good standing", icon: "shield", need: () => true },
  { name: "AI Guru", desc: "Earned 300 XP — top-tier learner", icon: "brain", need: (s: any) => s.xp >= 300 },
];

// Developer profile: XP level progress + gamified contribution badges, driven
// by /api/my/stats (XP from quizzes, comment and bookmark milestones).
export default function ProfilePage() {
  const { user, token, ready } = useAuth();
  const [stats, setStats] = useState<any>({ xp: 0, comments: 0, bookmarks: 0 });
  useEffect(() => { if (token) api.myStats(token).then((d: any) => setStats(d || stats)).catch(() => {}); }, [token]); // eslint-disable-line
  if (!ready) return null;
  if (!user) return (
    <div className="glass-card mx-auto max-w-lg p-8">
      <p className="text-zinc-400">Your profile tracks XP, badges, bookmarks and comments. Open a session at <b className="text-orange">#/login</b> to activate it.</p>
    </div>
  );
  const xp = stats.xp || 0;
  const lvl = Math.min(LEVELS.length - 1, Math.floor(xp / 100));
  const nextAt = (lvl + 1) * 100;
  const pct = Math.min(100, Math.round((xp / nextAt) * 100));
  return (
    <div className="grid gap-8">
      <div className="glass-card p-7">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-orange/40 bg-orange/10 font-display text-2xl font-bold text-orange">{String(user.name || user.email || "N").slice(0, 1).toUpperCase()}</div>
          <div>
            <h2 className="font-display text-3xl font-bold">{user.name || "Reader"}</h2>
            <p className="text-sm text-zinc-500">{user.email} · Level {lvl + 1}: <b className="text-orange">{LEVELS[lvl]}</b></p>
          </div>
          <div className="ml-auto text-right">
            <div className="font-display text-4xl font-bold text-orange">{xp}</div>
            <div className="font-mono text-[9px] uppercase tracking-[.2em] text-zinc-600">Total XP</div>
          </div>
        </div>
        <div className="mt-5 h-2 w-full rounded-full bg-white/5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-2 rounded-full bg-orange transition-all" style={{ width: pct + "%" }} />
        </div>
        <p className="mt-2 text-xs text-zinc-600">{Math.max(0, nextAt - xp)} XP to {LEVELS[Math.min(LEVELS.length - 1, lvl + 1)]}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["XP", xp, "from knowledge checks"], ["Comments", stats.comments || 0, "in the community"], ["Bookmarks", stats.bookmarks || 0, "saved articles"]].map(([n, v, t]) => (
          <div key={n} className="glass-card p-5"><div className="font-mono text-[9px] uppercase tracking-[.2em] text-orange">{n}</div><div className="mt-2 font-display text-3xl font-bold">{v}</div><div className="mt-1 text-[11px] text-zinc-600">{t}</div></div>
        ))}
      </div>
      <section aria-label="Contribution badges">
        <div className="font-mono text-[10px] uppercase tracking-[.25em] text-orange">Badges</div>
        <h3 className="mt-2 font-display text-2xl font-bold">Dev contribution badges</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b) => {
            const got = b.need(stats);
            const Icon = b.icon === "msg" ? MessageSquare : b.icon === "bm" ? Bookmark : b.icon === "zap" ? Zap : b.icon === "brain" ? Brain : ShieldCheck;
            return (
              <div key={b.name} className={"glass-card flex items-center gap-4 p-5 " + (got ? "" : "opacity-40")}>
                <div className={"grid h-12 w-12 shrink-0 place-items-center rounded-full border " + (got ? "border-orange/50 bg-orange/10 text-orange" : "border-line text-zinc-600")}><Icon size={20} aria-hidden /></div>
                <div><b className="font-display">{b.name}</b>{!got && <Lock size={11} className="ml-1.5 inline text-zinc-600" aria-hidden />}<p className="text-xs text-zinc-500">{b.desc}</p></div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
