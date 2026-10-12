import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

type Term = { t: string; c: string; d: string };

// Tech glossary: the vocabulary every developer and ICT student needs,
// searchable and grouped by topic.
const TERMS: Term[] = [
  { t: "API", c: "Backend", d: "Application Programming Interface — a contract that lets one program request data or actions from another." },
  { t: "Backend", c: "Backend", d: "The server side of an application: databases, business logic and APIs the user never sees directly." },
  { t: "Frontend", c: "Frontend", d: "Everything the user sees and interacts with in the browser or app, built with HTML, CSS and JavaScript." },
  { t: "Git", c: "Tooling", d: "A distributed version-control system that tracks every change to code and enables team collaboration." },
  { t: "Docker", c: "DevOps", d: "A platform that packages an app with its dependencies into a container that runs identically anywhere." },
  { t: "CI/CD", c: "DevOps", d: "Continuous Integration / Continuous Delivery — automatically building, testing and shipping code changes." },
  { t: "DNS", c: "Networking", d: "Domain Name System — the internet's directory that translates names like nextbit.com into IP addresses." },
  { t: "REST", c: "Backend", d: "A style of API built on HTTP verbs (GET, POST, PUT, DELETE) and predictable resource URLs." },
  { t: "GraphQL", c: "Backend", d: "A query language for APIs that lets the client ask for exactly the data it needs in one request." },
  { t: "SQL", c: "Data", d: "Structured Query Language — the standard language for querying relational databases." },
  { t: "Latency", c: "Networking", d: "The delay between a request and its response. Lower is faster; every millisecond compounds." },
  { t: "Cache", c: "Backend", d: "A fast temporary store for results you will need again, so you do not recompute or re-fetch them." },
  { t: "CDN", c: "Networking", d: "Content Delivery Network — servers distributed worldwide that serve files from near the user." },
  { t: "CORS", c: "Security", d: "Cross-Origin Resource Sharing — the browser's rules for which websites may call which APIs." },
  { t: "Encryption", c: "Security", d: "Encoding data so only holders of the right key can read it; the foundation of TLS and HTTPS." },
  { t: "Hashing", c: "Security", d: "A one-way transformation of data into a fixed fingerprint. Used for passwords (bcrypt, argon2) and integrity." },
  { t: "JWT", c: "Security", d: "JSON Web Token — a signed token that carries identity claims between client and server for authentication." },
  { t: "OAuth2", c: "Security", d: "The authorization framework behind 'Sign in with Google/GitHub' — apps get scoped access without your password." },
  { t: "Machine learning", c: "AI", d: "Programs that improve at a task by learning patterns from data instead of following hand-written rules." },
  { t: "LLM", c: "AI", d: "Large Language Model — an AI trained on massive text corpora to predict and generate language, like GPT or Claude." },
  { t: "RAG", c: "AI", d: "Retrieval-Augmented Generation — giving an LLM a knowledge base to search so its answers cite real sources." },
  { t: "Fine-tuning", c: "AI", d: "Extra training on top of a base model to specialise it on your data or task." },
  { t: "Prompt engineering", c: "AI", d: "The craft of writing instructions and examples that reliably steer an AI model's output." },
  { t: "Context window", c: "AI", d: "How much text a model can consider at once — its working memory for a conversation or document." },
  { t: "Throughput", c: "AI", d: "How fast a model generates output, measured in tokens per second. Critical for production apps." },
  { t: "Open source", c: "Culture", d: "Software whose source code is publicly available under a licence that allows study, change and redistribution." },
  { t: "Container", c: "DevOps", d: "A lightweight isolated environment that runs an app with its own filesystem and dependencies." },
  { t: "Kubernetes", c: "DevOps", d: "An orchestration system that automates deploying, scaling and healing containerised applications." },
  { t: "Environment variable", c: "Tooling", d: "A configuration value provided by the environment (like API keys) kept outside the codebase." },
  { t: "Framework", c: "Frontend", d: "A structured toolkit that provides scaffolding and conventions, like React or Django." },
  { t: "Component", c: "Frontend", d: "A reusable, self-contained piece of UI that manages its own markup, state and behaviour." },
  { t: "State management", c: "Frontend", d: "How an app organises the data that changes over time and shares it across components." },
  { t: "Responsive design", c: "Frontend", d: "Building one layout that adapts gracefully to any screen size, from phone to desktop." },
  { t: "Accessibility (a11y)", c: "Frontend", d: "Designing interfaces that people with disabilities can perceive, navigate and use." },
  { t: "Middleware", c: "Backend", d: "Code that runs between the server receiving a request and the route handling it — auth, logging, rate limits." },
  { t: "Rate limiting", c: "Security", d: "Capping how many requests a client may send per time window, the first defence against abuse." },
  { t: "Load balancer", c: "DevOps", d: "A traffic director that spreads requests across servers so no single machine is overwhelmed." },
  { t: "Microservices", c: "Architecture", d: "Splitting an application into small independent services that communicate over the network." },
  { t: "Monolith", c: "Architecture", d: "An application built as one deployable unit — simpler to run, and often the right first choice." },
  { t: "Webhook", c: "Backend", d: "A URL you register so another service can POST events to you in real time — e.g. a payment confirmed." },
  { t: "WebSocket", c: "Networking", d: "A persistent two-way connection between client and server, used for chat and live dashboards." },
  { t: "Regex", c: "Tooling", d: "Regular expressions — a compact pattern language for searching and transforming text." },
  { t: "SDK", c: "Tooling", d: "Software Development Kit — libraries and tooling a platform ships so you can build on it." },
  { t: "Dependency", c: "Tooling", d: "A third-party package your project needs; managed in Node by npm, and locked in package-lock.json." },
  { t: "Deployment", c: "DevOps", d: "The act of putting your code onto servers where users can reach it, ideally automated and repeatable." },
  { t: "Database index", c: "Data", d: "A lookup structure that makes queries fast; like a book's index for your data." },
  { t: "ORM", c: "Data", d: "Object-Relational Mapping — a layer that maps database rows to objects in your programming language." },
  { t: "NoSQL", c: "Data", d: "Databases that store flexible documents or key-values instead of rigid tables — e.g. MongoDB, Redis." },
  { t: "Shell / terminal", c: "Tooling", d: "The command-line interface for running programs, scripts and git on your machine." },
  { t: "Version control", c: "Culture", d: "Tracking every code change with history and authorship so teams can collaborate and roll back safely." },
  { t: "Testing pyramid", c: "Culture", d: "Many fast unit tests, some integration tests, a few end-to-end tests — the shape of a healthy suite." },
];

const CATS = ["All", ...Array.from(new Set(TERMS.map((t) => t.c)))].sort();

export default function Glossary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const list = useMemo(() => {
    const s = q.toLowerCase().trim();
    return TERMS.filter((t) => (cat === "All" || t.c === cat) && (!s || (t.t + " " + t.d).toLowerCase().includes(s)));
  }, [q, cat]);

  return (
    <div className="grid gap-8">
      <div className="flex border border-line bg-card">
        <Search className="m-4 text-zinc-600" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a term: JWT, latency, RAG…" aria-label="Search glossary"
          className="w-full bg-transparent py-4 outline-none" />
        <span className="m-5 shrink-0 font-mono text-[9px] text-orange">{list.length}/{TERMS.length}</span>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
        {CATS.map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
            className={`border px-4 py-2 text-sm transition ${cat === c ? "border-orange bg-orange font-semibold text-black" : "border-line text-zinc-400 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>
      <ol className="grid gap-4 md:grid-cols-2">
        {list.map((t) => (
          <li key={t.t} className="glass-card p-6">
            <div className="flex items-center gap-3"><BookOpen size={14} className="text-orange" aria-hidden /><b className="font-display text-xl font-semibold">{t.t}</b><span className="ml-auto font-mono text-[9px] uppercase tracking-[.2em] text-zinc-600">{t.c}</span></div>
            <p className="mt-3 text-sm leading-7 text-zinc-500">{t.d}</p>
          </li>
        ))}
        {!list.length && <p className="text-sm text-zinc-600">No term matches that search yet.</p>}
      </ol>
    </div>
  );
}
