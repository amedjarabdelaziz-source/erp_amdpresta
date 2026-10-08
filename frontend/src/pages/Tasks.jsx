import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";

const STATUS = {
  TODO: { label: "A faire", icon: Circle, cls: "text-slate-500" },
  IN_PROGRESS: { label: "En cours", icon: Clock, cls: "text-blue-600" },
  BLOCKED: { label: "Bloquee", icon: AlertCircle, cls: "text-red-600" },
  DONE: { label: "Terminee", icon: CheckCircle2, cls: "text-emerald-600" }
};

const PRIORITY = { LOW: "bg-slate-100 text-slate-600", MEDIUM: "bg-blue-100 text-blue-700", HIGH: "bg-amber-100 text-amber-700", URGENT: "bg-red-100 text-red-700" };

export default function Tasks() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assigneeId: "", siteId: "", priority: "MEDIUM", dueDate: "" });

  const load = () => api.get("/tasks").then(r => setItems(r.data));
  useEffect(() => {
    load();
    api.get("/users").then(r => setUsers(r.data));
    api.get("/sites").then(r => setSites(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/tasks", form); toast.success("Tache creee"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const updateStatus = async (id, status) => { await api.put("/tasks/" + id, { status }); load(); };
  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/tasks/" + id); load(); };

  const grouped = Object.keys(STATUS).reduce((acc, k) => { acc[k] = items.filter(t => t.status === k); return acc; }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Taches</h1><p className="text-sm text-slate-500">Suivi kanban des taches</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouvelle tache</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(STATUS).map(([status, cfg]) => {
          const Icon = cfg.icon;
          const list = grouped[status] || [];
          return (
            <div key={status} className="bg-slate-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className={"flex items-center gap-2 font-semibold text-sm " + cfg.cls}><Icon size={16} /> {cfg.label}</div>
                <span className="badge bg-white text-slate-600">{list.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {list.map(t => (
                  <div key={t.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm flex-1">{t.title}</p>
                      <button onClick={() => remove(t.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={12} /></button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={"badge " + (PRIORITY[t.priority] || "")}>{t.priority}</span>
                      {t.assignee && <span className="text-xs text-slate-500">{t.assignee.fullName}</span>}
                    </div>
                    <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} className="input text-xs mt-2 py-1">
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-2xl">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold">Nouvelle tache</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="label">Titre *</label><input required className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="label">Description</label><textarea rows="3" className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Assigne a</label>
                <select className="input" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                  <option value="">-- Aucun --</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
              </div>
              <div><label className="label">Site</label>
                <select className="input" value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })}>
                  <option value="">-- Aucun --</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="label">Priorite</label>
                <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="LOW">Basse</option><option value="MEDIUM">Moyenne</option><option value="HIGH">Haute</option><option value="URGENT">Urgente</option>
                </select>
              </div>
              <div><label className="label">Echeance</label><input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Creer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
