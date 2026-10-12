import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { api } from "../api";

// Anonymous, stable per-browser voter id until accounts are wired into voting.
// The server dedupes on (target, kind, voter); a logged-in user id can replace this later.
const voterId = (() => {
  try {
    let v = localStorage.getItem("nb-voter");
    if (!v) { v = crypto.randomUUID(); localStorage.setItem("nb-voter", v); }
    return v;
  } catch { return "anon"; }
})();

// Reddit-style upvote/downvote control with optimistic UI.
// initialCount/initialMine come from the parent's batched /api/votes fetch;
// the server total always wins on response.
export default function UpvoteButton({
  targetId, kind, initialCount = 0, initialMine = 0,
}: { targetId: string; kind: "story" | "tool"; initialCount?: number; initialMine?: number }) {
  const [count, setCount] = useState(initialCount);
  const [mine, setMine] = useState(initialMine);
  const [busy, setBusy] = useState(false);
  const first = useRef(true);

  // Adopt batched counts from the parent once they arrive.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setCount(initialCount);
    setMine(initialMine);
  }, [initialCount, initialMine]);

  async function cast(v: 1 | -1) {
    if (busy) return;
    setBusy(true);
    const optimistic = mine === v ? 0 : v;
    setCount((c) => c - mine + optimistic);
    setMine(optimistic);
    try {
      const d = await api.castVote(targetId, kind, v, voterId);
      setCount((d as any).count ?? count);
    } catch {
      setCount((c) => c - optimistic + mine); // revert on failure
      setMine(mine);
    } finally { setBusy(false); }
  }

  return (
    <div role="group" aria-label="Vote" onClick={(e) => e.stopPropagation()} className="flex items-center gap-0.5 rounded-lg border border-line bg-black/30 px-1">
      <button onClick={() => cast(1)} aria-label="Upvote" aria-pressed={mine === 1} className={`p-1 transition-colors ${mine === 1 ? "text-neon" : "text-zinc-600 hover:text-neon"}`}>
        <ChevronUp size={14} />
      </button>
      <span aria-live="polite" className="min-w-5 text-center font-mono text-[11px] font-bold text-zinc-300">{count}</span>
      <button onClick={() => cast(-1)} aria-label="Downvote" aria-pressed={mine === -1} className={`p-1 transition-colors ${mine === -1 ? "text-red-400" : "text-zinc-600 hover:text-red-400"}`}>
        <ChevronDown size={14} />
      </button>
    </div>
  );
}
