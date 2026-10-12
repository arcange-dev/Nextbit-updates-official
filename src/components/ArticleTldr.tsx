import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "../api";

// AI TL;DR card — sits at the top of article layouts.
// One LLM call per article, cached in sessionStorage so revisits are instant and free.
export default function ArticleTldr({ articleId, text }: { articleId: string; text: string }) {
  const cacheKey = `nb-tldr:${articleId}`;
  const [bullets, setBullets] = useState<string[] | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(cacheKey) || "null"); } catch { return null; }
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (bullets || !text) return;
    let alive = true;
    api.aiTldr(text)
      .then((d: { bullets?: string[] }) => {
        if (!alive || !d?.bullets?.length) return setFailed(true);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(d.bullets)); } catch {}
        setBullets(d.bullets);
      })
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [articleId]);

  if (failed) return null;

  return (
    <section aria-label="AI summary" className="relative mt-10 overflow-hidden rounded-2xl border border-neon/25 bg-neon/[.04] p-6 glow-neon">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-neon via-cyber to-transparent" />
      <h2 className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.25em] text-neon">
        <Sparkles size={14} aria-hidden /> AI TL;DR
      </h2>
      {!bullets ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 size={14} className="animate-spin" aria-hidden /> Generating summary…
        </p>
      ) : (
        <ul className="mt-4 grid gap-2.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-neon" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
