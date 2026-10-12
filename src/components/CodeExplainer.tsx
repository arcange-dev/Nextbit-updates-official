import { useEffect, useRef, useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { api } from "../api";

// AI Code Explainer — "Explain" chip on any code block header.
// Click reveals a popover with a short AI breakdown of the snippet.
export default function CodeExplainer({ code, language = "text" }: { code: string; language?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e.type === "keydown") {
        if ((e as KeyboardEvent).key === "Escape") setOpen(false);
      } else if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  async function explain() {
    setOpen((o) => true);
    if (text || busy) return;
    setBusy(true);
    try {
      const d = await api.aiExplain(code, language);
      setText((d as any).explanation || "Could not explain this snippet.");
    } catch (e: any) {
      setText(e?.message || "Explanation service unavailable.");
    } finally { setBusy(false); }
  }

  return (
    <div ref={box} className="relative">
      <button
        onClick={explain}
        aria-expanded={open}
        aria-label="Explain this code with AI"
        className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11px] text-cyber transition-colors hover:border-cyber/50 hover:text-neon"
      >
        <Wand2 size={12} aria-hidden /> Explain
      </button>
      <div
        role="tooltip"
        className={`absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-cyber/30 bg-card p-3 text-xs leading-relaxed text-zinc-300 shadow-xl glow-cyber transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {busy ? (
          <span className="flex items-center gap-2 text-cyber"><Loader2 size={14} className="animate-spin" aria-hidden /> Analyzing code…</span>
        ) : (
          text || "Click Explain to get an AI breakdown."
        )}
      </div>
    </div>
  );
}
