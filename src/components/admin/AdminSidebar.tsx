import { useState } from "react";
import {
  LayoutDashboard, Newspaper, PenSquare, MessageSquare, Rss, Users, Inbox as InboxIcon,
  Mail, ScrollText, Settings as SettingsIcon, RefreshCw, ImageIcon, LogOut, ChevronsLeft, ChevronsRight,
} from "lucide-react";

export type AdminTabId =
  | "overview" | "articles" | "comments" | "newsletter" | "settings"
  | "users" | "inbox" | "sources" | "activity" | "editor";

const GROUPS: { label: string; items: [AdminTabId, string, any][] }[] = [
  { label: "Overview", items: [["overview", "Dashboard", LayoutDashboard]] },
  { label: "Publishing", items: [["articles", "Content", Newspaper], ["editor", "Compose", PenSquare], ["comments", "Comments", MessageSquare]] },
  { label: "News intelligence", items: [["sources", "Sources", Rss]] },
  { label: "Audience", items: [["users", "Users", Users], ["inbox", "Inbox", InboxIcon], ["newsletter", "Newsletter", Mail]] },
  { label: "Insights", items: [["activity", "Audit log", ScrollText]] },
  { label: "System", items: [["settings", "Settings", SettingsIcon]] },
];

export default function AdminSidebar({
  user, tab, setTab, counts, refreshFeeds, backfillImages, signOut,
}: {
  user: { name: string; email: string };
  tab: AdminTabId;
  setTab: (t: AdminTabId) => void;
  counts: { articles?: number; comments?: number; users?: number; inbox?: number; sources?: number };
  refreshFeeds: () => void;
  backfillImages: () => void;
  signOut: () => void;
}) {
  const [wide, setWide] = useState(true);
  const countFor = (id: AdminTabId) =>
    id === "articles" ? counts.articles : id === "comments" ? counts.comments :
    id === "users" ? counts.users : id === "inbox" ? counts.inbox :
    id === "sources" ? counts.sources : undefined;

  return (
    <aside className="glass-card h-fit rounded-2xl p-3 lg:sticky lg:top-24">
      <div className={"mb-4 border-b border-line pb-4 " + (wide ? "" : "hidden")}>
        <div className="font-mono text-[9px] uppercase tracking-[.25em] text-orange">NEXTBIT / CONTROL</div>
        <div className="mt-2 font-display text-xl font-bold">{user.name}</div>
        <div className="mt-1 truncate text-xs text-zinc-600">{user.email}</div>
        <div className="mt-3 inline-flex border border-orange/20 bg-orange/5 px-2 py-1 font-mono text-[9px] text-orange">ADMIN</div>
      </div>
      <button
        onClick={() => setWide((w) => !w)}
        aria-label={wide ? "Collapse sidebar" : "Expand sidebar"}
        title={wide ? "Collapse sidebar" : "Expand sidebar"}
        className="mb-2 hidden w-full items-center justify-end rounded-lg px-2 py-1 text-zinc-500 hover:bg-white/5 hover:text-white lg:flex"
      >
        {wide ? <ChevronsLeft size={15} /> : <ChevronsRight size={15} />}
      </button>
      <nav className="grid gap-4">
        {GROUPS.map((g) => (
          <div key={g.label} className="grid gap-1">
            <div className={"px-2 font-mono text-[9px] uppercase tracking-[.25em] text-zinc-600 " + (wide ? "" : "hidden")}>{g.label}</div>
            {g.items.map(([id, label, Icon]) => {
              const n = countFor(id);
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  title={label}
                  aria-current={tab === id ? "page" : undefined}
                  className={
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors " +
                    (tab === id
                      ? "bg-orange font-semibold text-black"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white")
                  }
                >
                  <Icon size={16} className="shrink-0" aria-hidden />
                  <span className={wide ? "flex-1" : "hidden"}>{label}</span>
                  {wide && n !== undefined && <span className="text-[10px] opacity-60">{n}</span>}
                </button>
              );
            })}
            {g.label === "News intelligence" && (
              <div className="grid gap-1">
                <button onClick={refreshFeeds} title="Refresh live news feeds" className="flex items-center gap-3 rounded-xl border border-orange/20 bg-orange/5 px-4 py-3 text-left text-sm text-orange hover:bg-orange/10">
                  <RefreshCw size={16} className="shrink-0" aria-hidden />
                  <span className={wide ? "flex-1" : "hidden"}>Refresh live news</span>
                </button>
                <button onClick={backfillImages} title="Fetch missing images from each article's original source website" className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-left text-sm text-zinc-400 hover:border-orange hover:text-white">
                  <ImageIcon size={16} className="shrink-0" aria-hidden />
                  <span className={wide ? "flex-1" : "hidden"}>Auto-fetch images</span>
                </button>
              </div>
            )}
            {g.label === "System" && (
              <button onClick={signOut} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-left text-sm text-zinc-500 hover:text-white">
                <LogOut size={16} className="shrink-0" aria-hidden />
                <span className={wide ? "flex-1" : "hidden"}>Sign out</span>
              </button>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
