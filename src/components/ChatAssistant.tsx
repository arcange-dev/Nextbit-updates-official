import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { api } from "../api";
import { getChatContext } from "../lib/chatContext";

type Msg = { role: "user" | "assistant"; content: string };

// Collapsible floating AI assistant, mounted once at the app root.
// Pulls the current article text from the chat-context store so answers stay relevant.
export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hey! I'm NextBit Assistant. Ask me about the story you're reading or any tech topic." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const d = await api.aiChat(next.slice(-8), getChatContext());
      setMsgs((m) => [...m, { role: "assistant", content: (d as any).reply || "Sorry, I hit an error." }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "assistant", content: e?.message || "Assistant unavailable right now." }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className="fixed right-4 bottom-4 z-[70] flex size-14 items-center justify-center rounded-full bg-neon text-black shadow-xl transition-transform hover:scale-110 glow-neon"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <div
        role="dialog"
        aria-label="NextBit AI assistant"
        className={`fixed right-4 bottom-20 z-[70] flex w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl transition-all duration-200 ${
          open ? "h-96 opacity-100" : "pointer-events-none h-0 opacity-0"
        }`}
      >
        <header className="flex items-center gap-2 border-b border-line bg-black/40 px-4 py-3">
          <Bot size={15} className="text-neon" aria-hidden />
          <span className="font-display text-sm font-bold">NextBit Assistant</span>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[.2em] text-zinc-600">Context-aware</span>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "ml-auto bg-plasma/20 text-zinc-100" : "bg-white/[.04] text-zinc-300"
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy && <Loader2 size={16} className="animate-spin text-neon" aria-label="Assistant is typing" />}
          <div ref={endRef} />
        </div>

        <div className="flex gap-2 border-t border-line p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about this story…"
            aria-label="Message the assistant"
            className="flex-1 rounded-lg border border-line bg-black/30 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-neon/50"
          />
          <button onClick={send} disabled={busy} aria-label="Send message" className="rounded-lg bg-neon p-2.5 text-black disabled:opacity-40 glow-neon">
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
