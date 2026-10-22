// Extracted from App.tsx during the admin panel restructure (phase 2).
// Same JSX as before; the Admin shell passes all state and handlers as props.

import { AdminOfflineNote } from "../../App";

export default function InboxTab(props: any) {
  const { contacts, databaseStatus, updateContact } = props;
  return (
<div className="glass-card overflow-hidden">{databaseStatus!=="ok"&&<AdminOfflineNote/>}<div className="border-b border-line p-5"><div className="font-display text-xl font-bold">Editorial inbox</div><p className="mt-1 text-xs text-zinc-600">Corrections, partnerships and incoming messages.</p></div><div className="grid gap-3 p-5">{contacts.map(x=><div key={x.id} className="rounded-xl border border-line bg-black/20 p-5"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="font-semibold">{x.name} <span className="text-zinc-600">· {x.email}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{x.message}</p></div><select value={x.status} onChange={e=>updateContact(x.id,e.target.value)} className="border border-line bg-black/40 p-2 text-xs"><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="spam">Spam</option></select></div></div>)}</div></div>
  );
}