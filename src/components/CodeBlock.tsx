import { useEffect, useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";

// Syntax-highlighted code block with one-click copy and AI explain.
// The Shiki highlighter is loaded lazily ONCE for the whole app (module-level
// promise) so the ~300KB engine never blocks first paint.
type Shiki = { codeToHtml: (code: string, o: { lang: string; theme: string }) => string };
let shikiReady: Promise<Shiki> | null = null;
const getShiki = () =>
  (shikiReady ??= import("shiki").then((s) =>
    (s as any).createHighlighter({ themes: ["github-dark-default"], langs: ["ts", "tsx", "js", "bash", "json", "python", "sql"] })
  ));

const FALLBACK: Record<string, string> = { ts: "typescript", tsx: "typescript", js: "javascript", sh: "bash", zsh: "bash" };

export default function CodeBlock({ code, language = "ts", title }: { code: string; language?: string; title?: string }) {
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const lang = (FALLBACK[language] || language).toLowerCase();

  useEffect(() => {
    let alive = true;
    getShiki()
      .then((h) => h.codeToHtml(code, { lang, theme: "github-dark-default" }))
      .then((out) => { if (alive) setHtml(out); })
      .catch(() => {}); // unhighlighted <pre> fallback stays in place
    return () => { alive = false; };
  }, [code, lang]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <figure aria-label={title || `Code snippet (${lang})`} className="shiki-block my-8 overflow-hidden rounded-xl border border-line bg-[#0a0c12]">
      <figcaption className="flex items-center gap-2 border-b border-line bg-black/40 px-3 py-2">
        <FileCode2 size={13} className="text-cyber" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-[.15em] text-zinc-500">{title || lang}</span>
        <span className="ml-auto flex items-center gap-2">
          <button
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy code"}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
              copied ? "border-neon/50 text-neon" : "border-line text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </span>
      </figcaption>
      {/* Safe: Shiki generates this HTML locally from the code string, with escaping */}
      <div className="overflow-x-auto p-3.5 text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: html || `<pre style="margin:0"><code>${code.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre>` }} />
    </figure>
  );
}
