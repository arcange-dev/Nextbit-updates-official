import { useEffect, useState } from "react";
import { ArrowUpRight, Calendar, Globe2, MapPin } from "lucide-react";
import { api } from "../api";

type Opp = { title: string; kind: string; region: string; what: string; url: string; tag: string; scope: "africa" | "global" };

// Curated board of developer programs, grants, fellowships, job boards and
// communities across Africa. Static curation (checked periodically) + the live
// events calendar for deadlines.
const OPPS: Opp[] = [
  { title: "Google Africa Developer Scholarship", kind: "Scholarship", region: "Africa-wide", what: "Fully funded training tracks: Android, Web, Cloud and Flutter, with mentorship from Google Developer Groups.", url: "https://develop.google.africa", tag: "Free training" , scope: "africa" },
  { title: "ALX Software Engineering Programme", kind: "Program", region: "Africa-wide", what: "12-month software engineering and data programmes, accessible across African cities and remote.", url: "https://www.alxafrica.com", tag: "Career" , scope: "africa" },
  { title: "AWS re/Start", kind: "Program", region: "Africa-wide", what: "Amazon's free cloud career launch: 12 weeks of Linux, networking and AWS skills with job support.", url: "https://aws.amazon.com/training/restart", tag: "Cloud" , scope: "africa" },
  { title: "Andela Talent Network", kind: "Jobs", region: "Africa-wide / Remote", what: "Work with global companies as a vetted African engineer — the network that pioneered remote African tech talent.", url: "https://andela.com", tag: "Remote jobs" , scope: "africa" },
  { title: "Tony Elumelu Foundation Entrepreneurship Programme", kind: "Grant", region: "Africa-wide", what: "$5,000 seed capital plus training and mentoring for early-stage African founders, every year.", url: "https://www.tonyelumelufoundation.org", tag: "Funding" , scope: "africa" },
  { title: "Google for Startups Africa", kind: "Grant", region: "Africa-wide", what: "Equity-free funding, cloud credits and Google mentorship for African startups.", url: "https://startup.google.com/africa", tag: "Funding" , scope: "africa" },
  { title: "Y Combinator", kind: "Accelerator", region: "Remote", what: "The world's most influential startup accelerator — African founders from Flutterwave to Paystack went through it.", url: "https://www.ycombinator.com", tag: "Startups" , scope: "africa" },
  { title: "MEST Africa", kind: "Accelerator", region: "Ghana / Pan-African", what: "One-year training plus a seed fund for African tech entrepreneurs.", url: "https://meltwater.org", tag: "Startups" , scope: "africa" },
  { title: "Flat6Labs", kind: "Accelerator", region: "North Africa", what: "Seed funding and acceleration cycles across Egypt, Tunisia and the MENA region.", url: "https://flat6labs.com", tag: "Startups" , scope: "africa" },
  { title: "Norrsken22", kind: "VC fund", region: "Kigali / Africa", what: "Growth-stage venture backing African tech champions from its Kigali and continent-wide network.", url: "https://www.norrsken22.com", tag: "Funding" , scope: "africa" },
  { title: "Zindi competitions", kind: "Competition", region: "Africa-wide", what: "Data-science competitions on real African problems — win prizes and build a public portfolio.", url: "https://zindi.africa", tag: "Data" , scope: "africa" },
  { title: "GDG (Google Developer Groups)", kind: "Community", region: "Most African cities", what: "Free meetups, study jams and DevFests — the easiest way to plug into a local developer community.", url: "https://gdg.community", tag: "Community" , scope: "africa" },
  { title: "She Code Africa", kind: "Community", region: "Africa-wide", what: "Mentorship, bootcamps and job placements for African women in tech.", url: "https://shecodeafrica.org", tag: "Community" , scope: "africa" },
  { title: "Jobberman", kind: "Job board", region: "West Africa", what: "Nigeria and West Africa's biggest job platform, strong on tech roles.", url: "https://www.jobberman.com", tag: "Jobs" , scope: "africa" },
  { title: "BrighterMonday", kind: "Job board", region: "East Africa", what: "Kenya's leading job board with a solid tech category.", url: "https://www.brightermonday.co.ke", tag: "Jobs" , scope: "africa" },
  { title: "JobInRwanda", kind: "Job board", region: "Rwanda", what: "Rwanda's main job portal — ICT, engineering and NGO tech roles.", url: "https://www.jobinrwanda.com", tag: "Jobs" , scope: "africa" },
];

const GLOBAL: Opp[] = [
  { title: "Google Summer of Code", kind: "Internship", region: "Global / Remote", what: "Paid summer internship contributing to real open-source projects with expert mentors. 180+ organisations, fully remote.", url: "https://summerofcode.withgoogle.com", tag: "Paid · Open source", scope: "global" },
  { title: "Outreachy", kind: "Internship", region: "Global / Remote", what: "Paid remote internships in open source for applicants subject to systemic bias. Runs twice a year, $7,000 stipend.", url: "https://www.outreachy.org", tag: "Paid · Diversity", scope: "global" },
  { title: "MLH Fellowship", kind: "Internship", region: "Global / Remote", what: "12-week remote fellowship: open source, security research or web3 tracks, with stipend and corporate sponsorships.", url: "https://fellowship.mlh.io", tag: "Paid", scope: "global" },
  { title: "GitHub Campus Experts", kind: "Community", region: "Global", what: "GitHub's student leader programme: training, swag and support to build your campus tech community.", url: "https://education.github.com/experts", tag: "Students", scope: "global" },
  { title: "Microsoft Learn Student Ambassadors", kind: "Community", region: "Global", what: "Microsoft's student ambassador programme with Azure credits, certifications and mentorship.", url: "https://studentambassadors.microsoft.com", tag: "Students", scope: "global" },
  { title: "Google Developer Groups on Campus", kind: "Community", region: "Global", what: "Lead a Google developer community at your university — workshops, study jams and Google mentorship.", url: "https://gdg.community/programs/gdg-on-campus/", tag: "Students", scope: "global" },
  { title: "Mastercard Foundation Scholars Program", kind: "Scholarship", region: "Africa → Global", what: "Comprehensive scholarships for African students: tuition, living costs and leadership training at partner universities worldwide.", url: "https://mastercardfdn.org/all/scholars/", tag: "Full scholarship", scope: "global" },
  { title: "Chevening Scholarships", kind: "Scholarship", region: "UK", what: "Fully funded UK master's degrees for future leaders, including a large African cohort every year.", url: "https://www.chevening.org", tag: "Full scholarship", scope: "global" },
  { title: "DAAD Scholarships", kind: "Scholarship", region: "Germany", what: "Germany's development-focused scholarships for African graduates — study and research with living stipends.", url: "https://www.daad.de/en/", tag: "Full scholarship", scope: "global" },
  { title: "Coursera Financial Aid", kind: "Scholarship", region: "Global", what: "Apply for free access to almost any Coursera course or certificate, including Google and IBM career certificates.", url: "https://www.coursera.support", tag: "Free certificates", scope: "global" },
  { title: "Kaggle", kind: "Competition", region: "Global", what: "The world's biggest data-science competition platform — prize money, real datasets and a public portfolio.", url: "https://www.kaggle.com/competitions", tag: "Data", scope: "global" },
  { title: "freeCodeCamp", kind: "Training", region: "Global", what: "Completely free, project-based curriculum with certifications in web development, data analysis and machine learning.", url: "https://www.freecodecamp.org", tag: "Free", scope: "global" },
  { title: "The Odin Project", kind: "Training", region: "Global", what: "A free full-stack web development curriculum with a strong community and real portfolio projects.", url: "https://www.theodinproject.com", tag: "Free", scope: "global" },
  { title: "Harvard CS50", kind: "Training", region: "Global", what: "Harvard's legendary introduction to computer science, free online — plus AP computer science teacher training.", url: "https://cs50.harvard.edu/x/", tag: "Free · Harvard", scope: "global" },
  { title: "MIT OpenCourseWare", kind: "Training", region: "Global", what: "Thousands of MIT courses free online, from AI to entrepreneurship — no registration needed.", url: "https://ocw.mit.edu", tag: "Free · MIT", scope: "global" },
  { title: "Toptal", kind: "Jobs", region: "Global / Remote", what: "Elite remote freelance network for the top 3% of developers — high-rate, long-term client work.", url: "https://www.toptal.com", tag: "Remote jobs", scope: "global" },
  { title: "Wellfound", kind: "Job board", region: "Global", what: "The job board built for startup jobs — engineering roles at fast-growing companies worldwide.", url: "https://wellfound.com", tag: "Startups", scope: "global" },
  { title: "RemoteOK", kind: "Job board", region: "Global / Remote", what: "One of the largest remote job boards, strong for developers, designers and DevOps.", url: "https://remoteok.com", tag: "Remote jobs", scope: "global" },
  { title: "We Work Remotely", kind: "Job board", region: "Global / Remote", what: "Curated remote positions across programming, design and support at global companies.", url: "https://weworkremotely.com", tag: "Remote jobs", scope: "global" },
];

const KINDS = ["All", "Scholarship", "Program", "Internship", "Jobs", "Grant", "Accelerator", "Competition", "Community", "Job board", "Training"];
const SCOPES = ["All", "Africa", "Global"];

export default function Opportunities() {
  const [kind, setKind] = useState("All");
  const [scope, setScope] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const ALL = [...OPPS, ...GLOBAL];
  const list = ALL.filter((o) => (scope === "All" || o.scope === scope) && (kind === "All" || o.kind === kind));
  useEffect(() => { api.events().then((d: any) => setEvents(d || [])).catch(() => {}); }, []);

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Where">
        {SCOPES.map((sc) => (
          <button key={sc} role="tab" aria-selected={scope === sc} onClick={() => setScope(sc)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${scope === sc ? "bg-orange text-black" : "bg-white/5 text-zinc-400 hover:text-white"}`}>
            {sc === "All" ? "All opportunities" : sc === "Africa" ? "In Africa" : "Global & remote"}
          </button>
        ))}
        <span className="ml-auto self-center font-mono text-[9px] text-zinc-600">{list.length} programs</span>
      </div>
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
                <span className="ml-auto font-mono text-[9px] text-zinc-600">{o.scope === "global" ? "GLOBAL · " : ""}{o.tag}</span>
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
