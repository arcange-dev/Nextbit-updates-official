import { useState } from "react";
import { Play, RotateCcw, Terminal } from "lucide-react";
import CodeExplainer from "./CodeExplainer";

// Embedded live code sandbox: runs HTML/CSS/JS snippets fully client-side in a
// sandboxed iframe (allow-scripts only, no same-origin) — no external service.
const START = `<!-- Edit and hit Run. This executes 100% in your browser. -->
<h1>Hello from NextBit</h1>
<style>
  body { font-family: system-ui, sans-serif; background:#0a0a0a; color:#e6e6e6; padding:2rem; }
  h1 { color:#ffffff; }
</style>
<script>
  console.log("It works: " + (2 ** 10));
</script>`;

export default function LiveSandbox() {
  const [code, setCode] = useState(START);
  const [run, setRun] = useState(0);
  return (
    <section className="mt-14" aria-label="Live code sandbox">
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[.25em] text-orange"><Terminal size={13} aria-hidden /> Live sandbox</span>
          <span className="text-xs text-zinc-600">HTML · CSS · JS — sandboxed in your browser</span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setRun((x) => x + 1)} className="flex items-center gap-1 border border-orange/50 px-4 py-2 text-xs text-orange hover:bg-orange/10"><Play size={12} aria-hidden /> Run</button>
            <button onClick={() => { setCode(START); setRun(0); }} className="border border-line px-3 py-2 hover:border-orange" aria-label="Reset code"><RotateCcw size={12} aria-hidden /></button>
          </div>
        </div>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} aria-label="Code editor"
          className="mt-4 h-56 w-full border border-line bg-black/40 p-4 font-mono text-xs leading-6 outline-none focus:border-orange/50" />
        {run > 0 && (
          <div className="mt-3">
            <div className="border border-line bg-black/40 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.2em] text-zinc-600">Output (run #{run})</div>
            <iframe key={run} title="Sandbox output" sandbox="allow-scripts" className="h-56 w-full border border-t-0 border-line bg-black/40" srcDoc={code} />
          </div>
        )}
        <CodeExplainer code={code} language="html"/>
      </div>
    </section>
  );
}
