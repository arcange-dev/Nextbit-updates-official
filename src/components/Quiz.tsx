import { useState } from "react";
import { Award, Brain, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../api";

type Q = { q: string; a: string[]; c: number; why: string };
const QUESTIONS: Q[] = [
  { q: "What does an API let one program do?", a: ["Print documents", "Request data or actions from another program", "Compress images", "Manage your RAM"], c: 1, why: "An API is a contract for exchanging data and actions between programs." },
  { q: "Which Git command records a snapshot of your staged changes?", a: ["git push", "git clone", "git commit", "git fork"], c: 2, why: "git commit records the snapshot; push then uploads it to the remote." },
  { q: "What does CI/CD automate?", a: ["Only code style checks", "Building, testing and shipping code changes", "Database backups", "Email newsletters"], c: 1, why: "Continuous Integration / Delivery automates the path from commit to production." },
  { q: "How does RAG improve an LLM's answers?", a: ["Makes it run offline", "Lets it cite a knowledge base it retrieves from", "Removes the need for prompts", "Speeds up the GPU"], c: 1, why: "Retrieval-Augmented Generation grounds the model in sources it can cite." },
  { q: "Which protocol secures traffic between browser and server?", a: ["FTP", "SMTP", "TLS/HTTPS", "UDP"], c: 2, why: "TLS encrypts HTTP traffic — the S in HTTPS." },
];

// Skill assessment quiz: instant feedback, score math and XP attribution.
// Signed-in readers bank XP server-side; anonymous readers keep local XP.
export default function Quiz({ articleId }: { articleId: string }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [xpMsg, setXpMsg] = useState("");

  const pick = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === QUESTIONS[i].c) setScore((s) => s + 1);
  };
  const next = async () => {
    if (i + 1 < QUESTIONS.length) { setI(i + 1); setPicked(null); return; }
    setDone(true);
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const token = localStorage.getItem("nextbit_token");
    if (token) {
      try { const out: any = await api.quizComplete(token, { articleId, score: pct }); setXpMsg("+" + out.awarded + " XP banked · " + out.total + " total"); }
      catch { setXpMsg("Score saved locally."); }
    } else {
      const local = +(localStorage.getItem("nb_xp") || 0);
      localStorage.setItem("nb_xp", String(local + Math.round(pct / 10)));
      setXpMsg("Open a session at #/login to bank your XP.");
    }
  };
  const restart = () => { setI(0); setPicked(null); setScore(0); setDone(false); setXpMsg(""); };

  return (
    <section className="mt-14" aria-label="Knowledge check">
      <div className="glass-card p-7">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.25em] text-orange"><Brain size={14} aria-hidden /> Test yourself</div>
        {!done ? (
          <>
            <p className="mt-4 font-display text-xl font-semibold">{i + 1}. {QUESTIONS[i].q}</p>
            <ol className="mt-4 grid gap-2">
              {QUESTIONS[i].a.map((a, n) => (
                <li key={a}>
                  <button onClick={() => pick(n)} className={"w-full border px-4 py-3 text-left text-sm transition " + (picked === null ? "border-line hover:border-orange/50" : n === QUESTIONS[i].c ? "border-emerald-500 bg-emerald-500/10" : n === picked ? "border-red-500 bg-red-500/10" : "border-line opacity-50")}>{a}</button>
                </li>
              ))}
            </ol>
            {picked !== null && (
              <div className="mt-4 flex items-start gap-2 text-sm">
                {picked === QUESTIONS[i].c ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden /> : <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" aria-hidden />}
                <p className="text-zinc-400"><b>{picked === QUESTIONS[i].c ? "Correct. " : "Not quite. "}</b>{QUESTIONS[i].why}</p>
              </div>
            )}
            <button onClick={next} disabled={picked === null} className="liquid-button mt-5 disabled:opacity-40">{i + 1 === QUESTIONS.length ? "See score" : "Next question"}</button>
          </>
        ) : (
          <div className="mt-4 text-center">
            <Award size={30} className="mx-auto text-orange" aria-hidden />
            <p className="mt-3 font-display text-3xl font-bold">{score}/{QUESTIONS.length} · {Math.round((score / QUESTIONS.length) * 100)}%</p>
            <p className="mt-2 text-sm text-zinc-400">{xpMsg}</p>
            <button onClick={restart} className="liquid-button mt-5">Try again</button>
          </div>
        )}
      </div>
    </section>
  );
}
