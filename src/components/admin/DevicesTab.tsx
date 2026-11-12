import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { api } from "../../api";

// Admin panel: device catalogue sync/cleanup + the admin-managed opportunity board.
export default function DevicesTab(props: any) {
  const { token } = props;
  const [devices, setDevices] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", org: "", kind: "Program", region: "Africa", url: "", deadline: "" });

  const load = () => {
    api.devices().then((d: any) => setDevices(d?.items || [])).catch(() => {});
    api.jobs().then((d: any) => setJobs(d || [])).catch(() => {});
  };
  useEffect(() => { if (token) load(); }, [token]);

  const sync = async () => {
    setBusy(true); setMsg("");
    try { const out: any = await api.refreshDevices(token); setMsg("Synced " + (out?.synced ?? 0) + " devices from the web."); load(); }
    catch (e: any) { setMsg(e?.message || "Sync failed."); }
    setBusy(false);
  };

  const removeDevice = async (id: string) => {
    try { await api.deleteDevice(token, id); setDevices((l) => l.filter((x) => String(x.id) !== String(id))); } catch { setMsg("Could not delete that device."); }
  };

  const addJob = async () => {
    if (!form.title.trim()) { setMsg("Give the opportunity a title."); return; }
    setBusy(true); setMsg("");
    try {
      await api.createJob(token, { ...form, deadline: form.deadline || null });
      setForm({ title: "", org: "", kind: "Program", region: "Africa", url: "", deadline: "" });
      setMsg("Opportunity added to the public board.");
      load();
    } catch (e: any) { setMsg(e?.message || "Could not add it."); }
    setBusy(false);
  };

  const removeJob = async (id: string) => {
    try { await api.deleteJob(token, id); setJobs((l) => l.filter((x) => String(x.id) !== String(id))); } catch { setMsg("Could not delete it."); }
  };

  const field = (k: string, ph: string) => (
    <input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph}
      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange/50" />
  );

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[9px] text-orange">DEVICE CATALOGUE</div>
            <h2 className="mt-1 font-display text-2xl font-bold">Devices cloned from the web</h2>
            <p className="mt-1 text-xs text-zinc-500">Refreshes automatically every week from Wikipedia/Wikimedia (images, summaries, source links). {devices.length} devices stored.</p>
          </div>
          <button onClick={sync} disabled={busy} className="liquid-button ghost flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
            <RefreshCw size={14} className={busy ? "animate-spin" : ""} /> {busy ? "Working…" : "Sync now"}
          </button>
        </div>
        {msg && <p className="mt-3 text-sm text-zinc-600">{msg}</p>}
        <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white/90 text-[10px] uppercase tracking-[.2em] text-zinc-500 backdrop-blur">
              <tr><th className="px-3 py-2">Device</th><th className="px-3 py-2">Category</th><th className="px-3 py-2"></th></tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-t border-line">
                  <td className="px-3 py-2">{d.name}</td>
                  <td className="px-3 py-2 text-zinc-500">{d.category}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => removeDevice(d.id)} className="text-zinc-400 hover:text-red-500" aria-label={"Delete " + d.name}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {!devices.length && <tr><td colSpan={3} className="px-3 py-4 text-zinc-500">No devices yet. Press “Sync now”.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="font-mono text-[9px] text-orange">OPPORTUNITY BOARD</div>
        <h2 className="mt-1 font-display text-2xl font-bold">Add or remove opportunities</h2>
        <p className="mt-1 text-xs text-zinc-500">Anything you add appears at the top of the public Opportunities page. Remove entries when they close.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {field("title", "Title (e.g. Google Africa Scholarship)")}
          {field("org", "Organisation")}
          {field("kind", "Kind (Program, Grant, Jobs…)")}
          {field("region", "Region (Africa, Rwanda, Global…)")}
          {field("url", "Link (https://…)")}
          {field("deadline", "Deadline (YYYY-MM-DD, optional)")}
        </div>
        <button onClick={addJob} disabled={busy} className="liquid-button mt-3 px-5 py-2 text-sm disabled:opacity-50">Add opportunity</button>
        <div className="mt-4 grid gap-2">
          {jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm">
              <div>
                <b>{j.title}</b>
                <span className="ml-2 text-xs text-zinc-500">{j.org} · {j.kind} · {j.region}</span>
              </div>
              <button onClick={() => removeJob(j.id)} className="text-zinc-400 hover:text-red-500" aria-label={"Delete " + j.title}><Trash2 size={14} /></button>
            </div>
          ))}
          {!jobs.length && <p className="text-xs text-zinc-500">No admin-added opportunities yet.</p>}
        </div>
      </div>
    </div>
  );
}
