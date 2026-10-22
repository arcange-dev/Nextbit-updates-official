// Extracted from App.tsx during the admin panel restructure (phase 2).
// Same JSX as before; the Admin shell passes all state and handlers as props.

import { AdminOfflineNote } from "../../App";

export default function ActivityTab(props: any) {
  const { activity, databaseStatus } = props;
  return (
<div className="glass-card overflow-hidden">{databaseStatus!=="ok"&&<AdminOfflineNote/>}<div className="border-b border-line p-5"><div className="font-display text-xl font-bold">Audit trail</div><p className="mt-1 text-xs text-zinc-600">Administrative operations recorded by the backend.</p></div><div className="divide-y divide-white/5">{activity.map(x=><div key={x.id} className="flex flex-col gap-1 p-5 md:flex-row md:items-center md:justify-between"><div><span className="font-mono text-[10px] text-orange">{x.action}</span><div className="mt-1 text-sm text-zinc-300">{x.target_type||"system"} / {x.target_id||"—"}</div></div><div className="text-right text-xs text-zinc-600">{x.admin_name||"admin"} · {x.created_at?new Date(x.created_at).toLocaleString():"—"}</div></div>)}</div></div>
  );
}