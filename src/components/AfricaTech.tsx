import { ArrowRight, Banknote, Bot, Building2, GraduationCap, MapPin, Rocket } from "lucide-react";
import { api } from "../api";
import { useEffect, useState } from "react";

// Africa Tech page: startup showcase, tech hubs by country, African AI research
// and the mobile-money story that rewired a continent's economy.
const STARTUPS = [
  { name: "M-PESA", country: "Kenya", what: "The mobile-money pioneer that banked the unbanked and moved payments off the branch counter.", org: "Safaricom" },
  { name: "Flutterwave", country: "Nigeria", what: "Payments infrastructure connecting African businesses to global commerce.", org: "Payments" },
  { name: "Paystack", country: "Nigeria", what: "Merchant payments acquired by Stripe in 2020 — a landmark African exit.", org: "Payments" },
  { name: "Wave", country: "Senegal", what: "Mobile money with near-zero fees, Francophone Africa's first tech unicorn.", org: "Fintech" },
  { name: "Zipline", country: "Rwanda", what: "Drone delivery of blood and medicine to remote clinics, operating daily since 2016.", org: "Health logistics" },
  { name: "SafeBoda", country: "Uganda", what: "Motorcycle ride-hailing and super-app built for African cities.", org: "Mobility" },
  { name: "Wasoko", country: "Kenya", what: "B2B commerce platform digitising the corner-shop supply chain.", org: "Retail" },
  { name: "M-KOPA", country: "Kenya", what: "Pay-as-you-go solar and smartphones for off-grid households.", org: "Clean energy" },
  { name: "Yassir", country: "Algeria", what: "Francophone Africa's super-app for ride-hailing, delivery and payments.", org: "Super app" },
  { name: "Moniepoint", country: "Nigeria", what: "Banking infrastructure for small businesses; one of Africa's newest unicorns.", org: "Fintech" },
  { name: "Jumia", country: "Pan-African", what: "The first African tech company listed on the New York Stock Exchange.", org: "E-commerce" },
  { name: "Andela", country: "Pan-African", what: "Global talent network that trained thousands of African software engineers.", org: "Talent" },
];

const HUBS = [
  { city: "Kigali, Rwanda", name: "kLab & Norrsken", what: "Rwanda's flagship innovation community plus the Norrsken House startup hub, anchoring Kigali's ICT corridor." },
  { city: "Lagos, Nigeria", name: "CcHUB", what: "Africa's first tech hub and incubator, backing founders across the continent." },
  { city: "Nairobi, Kenya", name: "iHub", what: "The East African pioneer where Ushahidi, BRCK and generations of startups began." },
  { city: "Accra, Ghana", name: "MEST Africa", what: "Training entrepreneurs-in-residence and running a pan-African seed fund." },
  { city: "Cape Town, South Africa", name: "Silicon Cape", what: "The community behind South Africa's deepest pool of engineering talent and capital." },
  { city: "Cairo & Tunis", name: "Flat6Labs", what: "The MENA region's leading accelerator, with cycles across North Africa." },
  { city: "Johannesburg, South Africa", name: "22 on Sloane", what: "Africa's largest startup campus, hosting hundreds of founders a year." },
];

const AI_ORG = [
  { name: "Lelapa AI", what: "Africa-founded AI research company building language models like Ubuntu and Ubora for African languages and contexts." },
  { name: "Masakhane", what: "Grassroots NLP community building open datasets and models for African languages." },
  { name: "Zindi", what: "The largest data-science competition platform built for African problem-solving." },
  { name: "Google AI Accra", what: "Google's first AI research centre in Africa, opened in Accra in 2019." },
];

export default function AfricaTech() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { api.events().then((d: any) => setEvents((d || []).filter((e: any) => /africa|rwanda|kenya|nigeria|ghana|kigali|lagos|nairobi/i.test((e.title + " " + (e.location || "")))))).catch(() => {}); }, []);

  return (
    <div className="grid gap-14">
      {/* Story stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[["400+", "active tech hubs across the continent"], ["10+", "African tech unicorns to date"], ["$1B+", "in annual venture funding since 2021"]].map(([n, t]) => (
          <div key={n} className="glass-card p-6"><div className="font-display text-4xl font-bold text-orange">{n}</div><p className="mt-2 text-sm text-zinc-500">{t}</p></div>
        ))}
      </div>

      {/* Startup showcase */}
      <section aria-label="African startup showcase">
        <div className="font-mono text-[10px] uppercase tracking-[.25em] text-orange">Built in Africa, used worldwide</div>
        <h2 className="mt-2 font-display text-4xl font-bold">Startup showcase</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {STARTUPS.map((s) => (
            <article key={s.name} className="glass-card p-6">
              <div className="flex items-center gap-2"><Rocket size={15} className="text-orange" aria-hidden /><b className="font-display text-xl font-semibold">{s.name}</b></div>
              <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-zinc-600"><MapPin size={11} aria-hidden /> {s.country} · {s.org}</div>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{s.what}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Tech hubs */}
      <section aria-label="Tech hubs by country">
        <div className="font-mono text-[10px] uppercase tracking-[.25em] text-orange">Where to plug in</div>
        <h2 className="mt-2 font-display text-4xl font-bold">Tech hubs & incubators</h2>
        <ol className="mt-8 grid gap-4 lg:grid-cols-2">
          {HUBS.map((h) => (
            <li key={h.name} className="glass-card flex gap-4 p-6">
              <Building2 size={22} className="shrink-0 text-orange" aria-hidden />
              <div><b className="font-display text-lg">{h.name}</b><span className="ml-2 font-mono text-[10px] text-zinc-600">{h.city}</span><p className="mt-2 text-sm leading-6 text-zinc-500">{h.what}</p></div>
            </li>
          ))}
        </ol>
      </section>

      {/* Mobile money + African AI side by side */}
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="glass-card p-7">
          <Banknote size={20} className="text-orange" aria-hidden />
          <h3 className="mt-3 font-display text-2xl font-bold">The mobile-money revolution</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-500">
            Long before fintech was a global buzzword, M-PESA proved in 2007 that a phone could be a bank. Mobile money now moves
            hundreds of billions of dollars a year across Sub-Saharan Africa — more than the rest of the world combined — and it is
            the rails on which lending, insurance, savings and cross-border trade are being rebuilt.
          </p>
        </article>
        <article className="glass-card p-7">
          <Bot size={20} className="text-orange" aria-hidden />
          <h3 className="mt-3 font-display text-2xl font-bold">Africa's own AI</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-500">
            African researchers are building models that speak the continent's 2000+ languages and solve local problems.
          </p>
          <ul className="mt-4 grid gap-3">
            {AI_ORG.map((a) => (
              <li key={a.name}><b className="text-orange">{a.name}</b><span className="text-sm text-zinc-500"> — {a.what}</span></li>
            ))}
          </ul>
        </article>
      </section>

      {/* African events from the live calendar */}
      {events.length > 0 && (
        <section aria-label="African tech events">
          <div className="font-mono text-[10px] uppercase tracking-[.25em] text-orange">On the calendar</div>
          <h2 className="mt-2 font-display text-4xl font-bold">African tech events</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {events.slice(0, 6).map((e) => (
              <li key={e.id} className="glass-card p-5">
                <div className="font-mono text-[10px] text-orange">{new Date(e.starts_at).toLocaleDateString()} · {e.location || "Online"}</div>
                <b className="mt-2 block font-display text-lg">{e.title}</b>
                {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-orange hover:underline">Event page <ArrowRight className="inline" size={11} /></a>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Opportunities CTA */}
      <section className="grid-bg border border-line bg-card p-10 text-center">
        <GraduationCap size={26} className="mx-auto text-orange" aria-hidden />
        <h2 className="mt-4 font-display text-3xl font-bold">Scholarships, grants and jobs across Africa</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-500">A curated board of developer programs, startup grants, fellowships and communities — with application links.</p>
        <button onClick={() => (location.hash = "#/opportunities")} className="liquid-button mt-6">Open opportunities <ArrowRight className="ml-2 inline" size={15} /></button>
      </section>
    </div>
  );
}
