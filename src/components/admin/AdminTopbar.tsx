import { ExternalLink, RefreshCw } from "lucide-react";

export default function AdminTopbar({
  group, title, busy, onSync,
}: {
  group: string;
  title: string;
  busy?: boolean;
  onSync?: () => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card px-5 py-3">
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[9px] uppercase tracking-[.25em] text-zinc-600">
          NEXTBIT / {group.toUpperCase()}
        </div>
        <div className="truncate font-display text-lg font-bold">{title}</div>
      </div>
      <a href="/" target="_blank" rel="noreferrer" className="liquid-button ghost px-4 py-2 text-xs">
        <ExternalLink size={13} /> View website
      </a>
      {onSync && (
        <button onClick={onSync} disabled={busy} className="liquid-button ghost px-4 py-2 text-xs disabled:opacity-50">
          <RefreshCw size={13} className={busy ? "animate-spin" : ""} /> Sync
        </button>
      )}
    </div>
  );
}
