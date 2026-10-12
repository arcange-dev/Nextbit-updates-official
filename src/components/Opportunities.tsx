import { useEffect, useState } from "react";
import { ArrowUpRight, Calendar, Globe2, MapPin } from "lucide-react";
import { api } from "../api";

type Opp = { title: string; kind: string; region: string; what: string; url: string; tag: string };

// Curated board of developer programs, grants, fellowships, job boards and
// communities across Africa. Static curation (checked periodically) + the live
// events calendar for deadlines.
const OPPS: Opp[] = [
  { title: "Google Africa Developer Scholarship", kind: "Scholarship", region: "Africa-wide", what: "Fully funded training tracks: Android, Web, Cloud and Flutter, with mentorship from Google Developer Groups.", url: "https://develop.google.africa", tag: "Free training" },
  { title: "ALX Software Engineering Programme", kind: "Program", region: "Africa-wide", what: "12-month software engineering and data programmes, accessible across African cities and remote.", url: "https://www.alxafrica.com", tag: "Career" },
  { title: "AWS re/Start", kind: "Program", region: "Africa-wide", what: "Amazon's free cloud career launch: 12 weeks of Linux, networking and AWS skills with job support.", url: "https://aws.amazon.com/training/restart", tag: "Cloud" },
  { title: "Andela Talent Network", kind: "Jobs", region: "Africa-wide / Remote", what: "Work with global companies as a vetted African engineer — the network that pioneered remote African tech talent.", url: "https://andela.com", tag: "Remote jobs" },
  { title: "Tony Elumelu Foundation Entrepreneurship Programme", kind: "Grant", region: "Africa-wide", what: "$5,000 seed capital plus training and mentoring for early-stage African founders, every year.", url: "https://www.tonyelumelufoundation.org", tag: "Funding" },
  { title: "Google for Startups Africa", kind: "Grant", region: "Africa-wide", what: "Equity-free funding, cloud credits and Google mentorship for African startups.", url: "https://startup.google.com/africa", tag: "Funding" },
  { title: "Y Combinator", kind: "Accelerator", region: "Remote", what: "The world's most influential startup accelerator — African founders from Flutterwave to Paystack went through it.", url: "https://www.ycombinator.com", tag: "Startups" },
  { title: "MEST Africa", kind: "Accelerator", region: "Ghana / Pan-African", what: "One-year training plus a seed fund for African tech entrepreneurs.", url: "https://meltwater.org", tag: "Startups" },
  { title: "Flat6Labs", kind: "Accelerator", region: "North Africa", what: "Seed funding and acceleration cycles across Egypt, Tunisia and the MENA region.", url: "https://flat6labs.com", tag: "Startups" },
  { title: "Norrsken22", kind: "VC fund", region: "Kigali / Africa", what: "Growth-stage venture backing African tech champions from its Kigali and continent-wide network.", url: "https://www.norrsken22.com", tag: "Funding" },
  { title: "Zindi competitions", kind: "Competition", region: "Africa-wide", what: "Data-science competitions on real African problems — win prizes and build a public portfolio.", url: "https://zindi.africa", tag: "Data" },
  { title: "GDG (Google Developer Groups)", kind: "Community", region: "Most African cities", what: "Free meetups, study jams and DevFests — the easiest way to plug into a local developer community.", url: "https://gdg.community", tag: "Community" },
  { title: "She Code Africa", kind: "Community", region: "Africa-wide", what: "Mentorship, bootcamps and job placements for African women in tech.", url: "https://shecodeafrica.org", tag: "Community" },
  { title: "Jobberman", kind: "Job board", region: "West Africa", what: "Nigeria and West Africa's biggest job platform, strong on tech roles.", url: "https://www.jobberman.com", tag: "Jobs" },
  { title: "BrighterMonday", kind: "Job board", region: "East Africa", what: "Kenya's leading job board with a solid tech category.", url: "https://www.brightermonday.co.ke", tag: "Jobs" },
  { title: "JobInRwanda", kind: "Job board", region: "Rwanda", what: "Rwanda's main job portal — ICT, engineering and NGO tech roles.", url: "https://www.jobinrwanda.com", tag: "Jobs" },
];

const KINDS = ["All", "Scholarship", "Program", "Jobs", "Grant", "Accelerator", "Competition", "Community", "Job board"];

export default function Opportunities() {
  const [kind, setKind] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const list = OPPS.filter((o) => kind === "All" || o.kind === kind);
  useEffect(() => { api.events().then((d: any) => setEvents(d || [])).catch(() => {}); }, []);

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Opportunity types">
        {KINDS.map((k) => (
          <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
            className={`border px-4 py-2 text-sm transition ${kind === k ? "border-orange bg-orange font-semibold text-black" : "border-line text-zinc-400 hover:text-white"}`}>
            {k}
          </button>
        ))}
      </div>

      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((o) => (
          <li key={o.title}>
            <a href={o.url} target="_blank" rel="noopener noreferrer" className="glass-card group flex h-full flex-col gap-3 p-6 transition hover:border-orange/40">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[.15em] text-orange">{o.kind}</span>
                <span className="ml-auto font-mono text-[9px] text-zinc-600">{o.tag}</span>
              </div>
              <b className="font-display text-xl font-semibold leading-snug group-hover:text-orange">{o.title}</b>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-600"><MapPin size={11} aria-hidden /> {o.region}</div>
              <p className="text-sm leading-6 text-zinc-500">{o.what}</p>
              <span className="mt-auto flex items-center gap-1 text-xs text-orange">Apply / visit <ArrowUpRight size={12} aria-hidden /></span>
            </a>
          </li>
        ))}
      </ol>

      {events.length > 0 && (
        <section aria-label="Upcoming application and event deadlines">
          <div className="font-mono text-[10px] uppercase tracking-[.25em] text-orange">Deadlines ahead</div>
          <h2 className="mt-2 font-display text-3xl font-bold">Upcoming events</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-2">
            {events.slice(0, 6).map((e) => (
              <li key={e.id} className="glass-card flex items-center gap-4 p-5">
                <Calendar size={18} className="shrink-0 text-orange" aria-hidden />
                <div><b className="block font-display text-lg">{e.title}</b>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-600"><Globe2 size={11} aria-hidden /> {new Date(e.starts_at).toLocaleDateString()} · {e.location || "Online"}</span></div>
                {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 text-xs text-orange hover:underline">Details</a>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
