import { useEffect, useState } from "react";
import Chip3D from "./Chip3D";

// First-load welcome screen: brand intro + feature overview, shown while the site boots.
const FEATURES = ["Live verified news", "ICT roadmaps", "Hands-on projects", "Africa Tech", "AI news & models"];

export default function WelcomeLoader({ done }: { done: boolean }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(t);
  }, [done]);
  if (gone) return null;
  return (
    <div
      role="status"
      aria-label="Welcome to NextBit Updates"
      className={`fixed inset-0 z-[100] grid place-items-center bg-ink transition-all duration-700 ${done ? "pointer-events-none translate-y-[-3%] opacity-0" : "opacity-100"}`}
    >
      <div className="page-in px-6 text-center">
        <div className="mx-auto grid h-[220px] place-items-center [perspective:900px]">
          <Chip3D size={190} layers={3} />
        </div>
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.35em] text-orange">● Welcome to</div>
        <h1 className="hero-title font-display text-5xl font-bold leading-none md:text-7xl">NEXTBIT UPDATES</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-zinc-400">
          Your global ICT news web — verified technology journalism, worldwide ICT roadmaps, hands-on build
          projects, Africa Tech coverage and live AI news &amp; models.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {FEATURES.map((f) => (
            <span key={f} className="border border-line bg-card px-3 py-1.5 text-[11px] text-zinc-400">{f}</span>
          ))}
        </div>
        <div className="mx-auto mt-9 h-[3px] w-56 overflow-hidden bg-line">
          <div className="h-full w-full bg-orange" style={{ animation: "loadbar 1.1s ease-in-out infinite", transformOrigin: "left" }} />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">Loading the signal…</p>
      </div>
    </div>
  );
}
