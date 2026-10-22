// Extracted from App.tsx during the admin panel restructure (phase 2).
// Same JSX as before; the Admin shell passes all state and handlers as props.

import { api } from "../../api";
import { AdminOfflineNote } from "../../App";

export default function CommentsTab(props: any) {
  const { databaseStatus, modComments, remove, setModComments, setMsg, token } = props;
  return (
<div className="glass-card overflow-hidden">{databaseStatus!=="ok"&&<AdminOfflineNote/>}<div className="border-b border-line p-5"><div className="font-mono text-[10px] text-orange">COMMENT MODERATION</div><p className="mt-2 text-sm text-zinc-500">Hide disruptive comments (soft delete) or remove them permanently. Hidden comments stay in the audit trail.</p></div><div className="divide-y divide-line">{modComments.length?modComments.map((mc:any)=><div key={mc.id} className="p-5"><div className="flex flex-wrap items-center gap-2"><b className="text-sm">{mc.author_name}</b><span className="text-[11px] text-zinc-600">{mc.article_title||"Deleted article"}</span>{mc.hidden&&<span className="border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[9px] text-red-400">HIDDEN</span>}<time className="ml-auto text-[10px] text-zinc-600">{new Date(mc.created_at).toLocaleString()}</time></div><p className="mt-2 text-sm text-zinc-300">{mc.body}</p><div className="mt-3 flex gap-2"><button onClick={async()=>{try{await api.adminSetCommentHidden(token,mc.id,!mc.hidden);setModComments((cs:any[])=>cs.map(x=>x.id===mc.id?{...x,hidden:!mc.hidden}:x))}catch(e){setMsg(e instanceof Error?e.message:"Update failed")}}} className="border border-line px-3 py-1.5 text-xs hover:border-orange">{mc.hidden?"Unhide":"Hide"}</button><button onClick={async()=>{if(!confirm("Permanently delete this comment?"))return;try{await api.adminDeleteComment(token,mc.id);setModComments((cs:any[])=>cs.filter(x=>x.id!==mc.id))}catch(e){setMsg(e instanceof Error?e.message:"Delete failed")}}} className="border border-line px-3 py-1.5 text-xs text-red-400 hover:border-red-500">Delete</button></div></div>):<p className="p-5 text-sm text-zinc-600">No comments to moderate yet.</p>}</div></div>
  );
}