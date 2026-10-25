// Extracted from App.tsx during the admin panel restructure (phase 2).
// Same JSX as before; the Admin shell passes all state and handlers as props.

import { useEffect, useState } from "react";
import { AdminOfflineNote } from "../../App";
import { api } from "../../api";

export default function NewsletterTab(props: any) {
  const { busy, databaseStatus, nl, nlForm, nlMsg, sendDigest, setNlForm, token } = props;
  const [subs, setSubs] = useState<any[]>([]);
  const [subsBusy, setSubsBusy] = useState(false);
  const [subsErr, setSubsErr] = useState("");
  const [q, setQ] = useState("");
  const loadSubs = () => {
    if (!token || databaseStatus !== "ok") return;
    setSubsBusy(true); setSubsErr("");
    api.newsletterSubscribers(token, q.trim() || undefined)
      .then((d: any) => setSubs(d?.items || []))
      .catch((e: any) => setSubsErr(e?.message || "Could not load the subscriber list."))
      .finally(() => setSubsBusy(false));
  };
  useEffect(() => { loadSubs(); /* eslint-disable-next-line */ }, [token, databaseStatus, q]);
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        {databaseStatus !== "ok" && <AdminOfflineNote />}
        <div className="glass-card p-6"><div className="font-mono text-[9px] text-orange">EMAIL ENGINE</div><h2 className="mt-2 font-display text-2xl font-bold">Newsletter status</h2><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="border border-line p-4"><div className="font-display text-3xl font-bold">{nl?.subscribers??"-"}</div><div className="text-[10px] text-zinc-500">TOTAL</div></div><div className="border border-line p-4"><div className="font-display text-3xl font-bold text-emerald-400">{nl?.active??"-"}</div><div className="text-[10px] text-zinc-500">ACTIVE</div></div><div className="border border-line p-4"><div className={"font-display text-xl font-bold "+(nl?.configured?"text-emerald-400":"text-orange")}>{nl?(nl.configured?"READY":"NOT SET"):"-"}</div><div className="text-[10px] text-zinc-500">SENDER</div></div></div>{nl&&!nl.configured&&<p className="mt-4 text-sm leading-6 text-orange">Add <b>BREVO_API_KEY</b> in the Render environment to turn on sending (free at brevo.com — 300 emails/day, verify your email as the sender; no domain needed).</p>}{nl?.configured&&<p className="mt-4 text-xs text-zinc-500">Sending as {nl.from}</p>}</div>
        <div className="glass-card p-6"><div className="font-mono text-[9px] text-orange">COMPOSE</div><h2 className="mt-2 font-display text-2xl font-bold">Send the latest news digest</h2><p className="mt-2 text-sm text-zinc-500">Emails the 6 newest published stories (with images) to every active subscriber. Each email has a one-click unsubscribe link.</p><div className="mt-5 grid gap-3"><input value={nlForm.subject} onChange={e=>setNlForm({...nlForm,subject:e.target.value})} placeholder="Subject (optional, default: The NextBit Brief - date)" className="border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50"/><textarea value={nlForm.intro} onChange={e=>setNlForm({...nlForm,intro:e.target.value})} placeholder="Short intro message (optional)" className="min-h-20 border border-line bg-black/30 p-4 text-sm outline-none focus:border-orange/50"/><div className="flex flex-wrap gap-2"><input type="email" value={nlForm.testTo} onChange={e=>setNlForm({...nlForm,testTo:e.target.value})} placeholder="Test email address" className="min-w-0 flex-1 border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50"/><button type="button" disabled={busy||!nlForm.testTo} onClick={()=>sendDigest(true)} className="border border-line px-5 py-3 text-sm hover:border-orange disabled:opacity-40">Send test</button></div><button type="button" disabled={busy} onClick={()=>sendDigest(false)} className="liquid-button">Send to all subscribers</button>{nlMsg&&<p className="text-sm text-zinc-300">{nlMsg}</p>}</div></div>
      </div>
      <div className="glass-card p-6">
        <div className="font-mono text-[9px] text-orange">SUBSCRIBERS</div>
        <h2 className="mt-2 font-display text-2xl font-bold">Everyone subscribed to The NextBit Brief</h2>
        <p className="mt-2 text-sm text-zinc-500">The full list of newsletter subscribers, newest first. Use the search box to find someone by email.</p>
        {databaseStatus !== "ok" ? (
          <p className="mt-4 text-sm leading-5 text-zinc-500">The subscriber list appears once the database connection is restored.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email…" aria-label="Search subscribers by email" className="min-w-0 flex-1 border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-orange/50" />
              <button type="button" onClick={loadSubs} disabled={subsBusy} className="border border-line px-4 py-3 text-sm hover:border-orange disabled:opacity-40">{subsBusy ? "Loading…" : "Refresh"}</button>
            </div>
            {subsErr && <p className="mt-3 text-sm text-amber-300">{subsErr}</p>}
            {!subsErr && subs.length === 0 && !subsBusy && (
              <p className="mt-4 text-sm text-zinc-500">{q ? "No subscribers match that search." : "No subscribers yet. They appear here the moment someone joins from the public site."}</p>
            )}
            {subs.length > 0 && (
              <div className="mt-2">
                <div className="mb-2 text-xs text-zinc-500">{subs.length} {subs.length === 1 ? "subscriber" : "subscribers"}</div>
                <div className="max-h-96 overflow-y-auto rounded-xl border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-black/60 text-[10px] uppercase tracking-[.2em] text-zinc-500 backdrop-blur">
                      <tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last digest</th></tr>
                    </thead>
                    <tbody>
                      {subs.map((s: any) => (
                        <tr key={s.id} className="border-t border-line">
                          <td className="break-all px-4 py-3">{s.email}</td>
                          <td className="px-4 py-3 text-zinc-500">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}</td>
                          <td className="px-4 py-3">{s.unsubscribed ? <span className="text-red-400">Unsubscribed</span> : <span className="text-emerald-400">Active</span>}</td>
                          <td className="px-4 py-3 text-zinc-500">{s.last_sent_at ? new Date(s.last_sent_at).toLocaleDateString() : "Never"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
