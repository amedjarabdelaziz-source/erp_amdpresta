import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, HardHat } from "lucide-react";

const PRIORITY = {
  LOW: { label: "Basse", cls: "bg-slate-100 text-slate-600" },
  MEDIUM: { label: "Moyenne", cls: "bg-blue-100 text-blue-700" },
  HIGH: { label: "Haute", cls: "bg-amber-100 text-amber-700" },
  URGENT: { label: "Urgente", cls: "bg-red-100 text-red-700" }
};

export default function Travaux() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", clientId: "", priority: "MEDIUM", startDate: "", endDate: "", budget: "" });

  const load = () => api.get("/travaux").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/clients").then(r => setClients(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/travaux", form); toast.success("Travaux crees"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/travaux/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Travaux</h1><p className="text-sm text-slate-500">Projets de maintenance</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouveaux travaux</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(t => (
          <div key={t.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2"><HardHat size={18} className="text-brand-600" /><span className="font-mono text-xs text-slate-500">{t.code}</span></div>
              <span className={"badge " + ((PRIORITY[t.priority] && PRIORITY[t.priority].cls) || "")}>{(PRIORITY[t.priority] && PRIORITY[t.priority].label) || t.priority}</span>
            </div>
            <h3 className="font-semibold mb-1">{t.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{t.description || "Pas de description"}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-3">
              <span>{(t.tasks && t.tasks.length) || 0} taches</span>
              <button onClick={() => remove(t.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full card p-8 text-center text-slate-400">Aucun travaux</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-2xl">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold">Nouveaux travaux</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="label">Titre *</label><input required className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="label">Description</label><textarea rows="3" className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Client</label>
                <select className="input" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">-- Choisir --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="label">Priorite</label>
                <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div><label className="label">Debut</label><input type="date" className="input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><label className="label">Fin</label><input type="date" className="input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
              <div><label className="label">Budget (MAD)</label><input type="number" className="input" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} /></div>
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
