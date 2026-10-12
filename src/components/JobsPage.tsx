import { useEffect, useState } from "react";
import { Briefcase, MapPin, Send } from "lucide-react";
import { api } from "../api";

const TAGS = ["All", "AI", "Frontend", "Backend", "DevOps", "Data", "Security"];
const WORKPLACE: Record<string, string> = { remote: "Remote", onsite: "On-site", hybrid: "Hybrid" };

// Tech & AI job board: public listings from /api/jobs (filter by tag + search)
// plus a recruiter form that submits to moderation (server re-validates with zod).
export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [tag, setTag] = useState("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", company: "", location: "Remote", workplace: "remote", tag: "AI", salaryMin: "", salaryMax: "", currency: "USD", stack: "", applyUrl: "", description: "" });
  const [fmsg, setFmsg] = useState("");
  const [ferr, setFerr] = useState("");

  const load = () => {
    setLoading(true);
    api.jobsList(tag === "All" ? undefined : tag, q || undefined).then((d: any) => setJobs(d || [])).catch(() => setJobs([])).finally(() => setLoading(false));
  };
  useEffect(load, [tag]);

  const money = (j: any) => (j.salary_min || j.salary_max) ? j.currency + " " + (j.salary_min ? Number(j.salary_min).toLocaleString() : "—") + " – " + (j.salary_max ? Number(j.salary_max).toLocaleString() : "—") : "Salary undisclosed";

  const submit = async (e: any) => {
    e.preventDefault();
    const errs: string[] = [];
    if (form.title.trim().length < 4) errs.push("Job title must be at least 4 characters.");
    if (form.company.trim().length < 2) errs.push("Company name must be at least 2 characters.");
    if (!/^https?:\/\/.+\..+/.test(form.applyUrl.trim())) errs.push("Apply link must be a valid URL (https://…).");
    const min = +form.salaryMin || 0, max = +form.salaryMax || 0;
    if (min < 0 || max < 0 || (min && max && max < min)) errs.push("Salary range is invalid (max must be ≥ min).");
    if (form.description.length > 3000) errs.push("Description is too long (3000 characters max).");
    if (errs.length) { setFerr(errs.join(" ")); setFmsg(""); return; }
    setFerr("");
    try {
      await api.postJob({ title: form.title, company: form.company, location: form.location, workplace: form.workplace, tag: form.tag, salaryMin: min, salaryMax: max, currency: form.currency || "USD", stack: form.stack.split(",").map((s) => s.trim()).filter(Boolean), applyUrl: form.applyUrl.trim(), description: form.description });
      setFmsg("Listing received. It goes live after editorial review — usually within 24h.");
      setForm({ ...form, title: "", company: "", stack: "", applyUrl: "", description: "" });
    } catch (err) { setFerr(err instanceof Error ? err.message : "Submission failed"); setFmsg(""); }
  };

  return (
    <div className="grid gap-12">
      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Job categories">
          {TAGS.map((t) => (
            <button key={t} role="tab" aria-selected={tag === t} onClick={() => setTag(t)} className={"border px-4 py-2 text-sm transition " + (tag === t ? "border-orange bg-orange font-semibold text-black" : "border-line text-zinc-400 hover:text-white")}>{t}</button>
          ))}
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search role or stack…" aria-label="Search jobs" className="ml-auto w-full border border-line bg-black/30 px-4 py-2 text-sm outline-none focus:border-orange/50 sm:w-64" />
        </div>
        {loading ? (
          <div className="mt-8 grid gap-4">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-28" />)}</div>
        ) : jobs.length ? (
          <ol className="mt-8 grid gap-4">
            {jobs.map((j) => (
              <li key={j.id} className="glass-card p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="font-display text-xl font-semibold">{j.title}</b>
                  <span className="font-mono text-[9px] uppercase tracking-[.2em] text-orange">{j.tag}</span>
                  <span className="ml-auto font-mono text-[10px] text-zinc-600">{new Date(j.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5"><Briefcase size={13} aria-hidden /> {j.company} · {WORKPLACE[j.workplace] || j.workplace}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={13} aria-hidden /> {j.location}</span>
                  <span className="text-orange">{money(j)}</span>
                </div>
                {j.description && <p className="mt-3 text-sm leading-6 text-zinc-400">{j.description}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(j.stack || []).map((s: string) => <span key={s} className="border border-line px-2 py-1 font-mono text-[10px] text-zinc-400">{s}</span>)}
                  <a href={j.apply_url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 border border-orange/40 px-4 py-2 text-sm text-orange hover:bg-orange/10">Apply <Send size={12} aria-hidden /></a>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="mt-8 text-sm text-zinc-600">No live listings in this category yet — recruiters can post below.</p>}
      </div>

      <section aria-label="Post a job">
        <div className="glass-card p-7">
          <div className="font-mono text-[10px] uppercase tracking-[.25em] text-orange">For recruiters</div>
          <h2 className="mt-2 font-display text-2xl font-bold">Post a job</h2>
          <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-2">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job title *" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50" />
            <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company *" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50" />
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50" />
            <select value={form.workplace} onChange={(e) => setForm({ ...form, workplace: e.target.value })} aria-label="Workplace" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50">
              <option value="remote">Remote</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option>
            </select>
            <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} aria-label="Category" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50">
              {TAGS.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="Currency (USD, RWF…)" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50" />
            <input inputMode="numeric" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="Salary min" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50" />
            <input inputMode="numeric" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} placeholder="Salary max" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50" />
            <input required type="url" value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} placeholder="Apply link (https://…) *" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50 sm:col-span-2" />
            <input value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} placeholder="Tech stack required (comma separated: React, Python, AWS)" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50 sm:col-span-2" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="min-h-24 border border-line bg-black/30 p-4 text-sm outline-none focus:border-orange/50 sm:col-span-2" />
            <button className="liquid-button sm:col-span-2">Submit listing</button>
          </form>
          {ferr && <p role="alert" className="mt-3 text-sm text-red-400">{ferr}</p>}
          {fmsg && <p className="mt-3 text-sm text-emerald-400">{fmsg}</p>}
        </div>
      </section>
    </div>
  );
}
