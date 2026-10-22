// Extracted from App.tsx during the admin panel restructure (phase 2).
// Same JSX as before; the Admin shell passes all state and handlers as props.

import { User } from "lucide-react";
import { Admin, AdminOfflineNote } from "../../App";

export default function UsersTab(props: any) {
  const { Editor, databaseStatus, editUser, users } = props;
  return (
<div className="glass-card overflow-hidden">{databaseStatus!=="ok"&&<AdminOfflineNote/>}<div className="border-b border-line p-5"><div className="font-display text-xl font-bold">User control</div><p className="mt-1 text-xs text-zinc-600">Manage roles and account access.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b border-line text-[10px] uppercase tracking-[.15em] text-zinc-600"><th className="p-4">User</th><th>Role</th><th>Status</th><th>Last login</th><th>Created</th></tr></thead><tbody>{users.map(u=><tr key={u.id} className="border-b border-line/60"><td className="p-4"><div className="font-semibold">{u.name}</div><div className="text-xs text-zinc-600">{u.email}</div></td><td><select value={u.role} onChange={e=>editUser(u.id,"role",e.target.value)} className="border border-line bg-black/40 p-2 text-xs"><option value="user">User</option><option value="editor">Editor</option><option value="admin">Admin</option></select></td><td><select value={u.status} onChange={e=>editUser(u.id,"status",e.target.value)} className="border border-line bg-black/40 p-2 text-xs"><option value="active">Active</option><option value="suspended">Suspended</option></select></td><td className="text-xs text-zinc-600">{u.last_login_at?new Date(u.last_login_at).toLocaleString():"Never"}</td><td className="text-xs text-zinc-600">{u.created_at?new Date(u.created_at).toLocaleDateString():"—"}</td></tr>)}</tbody></table></div></div>
  );
}