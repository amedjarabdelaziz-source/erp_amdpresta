import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Wrench, Camera } from "lucide-react";

const STATUS = { PLANNED: "Planifiee", ON_SITE: "Sur site", COMPLETED: "Terminee", CANCELLED: "Annulee" };
const STATUS_CLS = { PLANNED: "bg-blue-100 text-blue-700", ON_SITE: "bg-amber-100 text-amber-700", COMPLETED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-slate-200 text-slate-600" };

export default function Interventions() {
  const [items, setItems] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", siteId: "", technicianId: "", scheduledAt: "", status: "PLANNED" });

  const load = () => api.get("/interventions").then(r => setItems(r.data));
  useEffect(() => {
    load();
    api.get("/sites").then(r => setSites(r.data));
    api.get("/users").then(r => setUsers(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/interventions", form); toast.success("Intervention creee"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const updateStatus = async (id, status) => { await api.put("/interventions/" + id, { status }); load(); };
  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/interventions/" + id); load(); };

  const uploadPhoto = async (interventionId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("interventionId", interventionId);
    try { await api.post("/uploads", fd); toast.success("Photo ajoutee"); load(); }
    catch { toast.error("Erreur upload"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Interventions</h1><p className="text-sm text-slate-500">Planning et suivi des interventions</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouvelle intervention</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Code</th><th className="table-th">Titre</th><th className="table-th">Site</th><th className="table-th">Technicien</th><th className="table-th">Date</th><th className="table-th">Statut</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(i => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{i.code}</td>
                <td className="table-td font-medium">{i.title}</td>
                <td className="table-td">
                  {i.site && i.site.name}
                  <div className="text-xs text-slate-500">{i.site && i.site.client && i.site.client.name}</div>
                </td>
                <td className="table-td">{(i.technician && i.technician.fullName) || "-"}</td>
                <td className="table-td">{new Date(i.scheduledAt).toLocaleString("fr-FR")}</td>
                <td className="table-td">
                  <select value={i.status} onChange={e => updateStatus(i.id, e.target.value)} className={"badge " + (STATUS_CLS[i.status] || "") + " border-0 cursor-pointer"}>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="table-td">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setDetail(i)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><Camera size={16} /></button>
                    <button onClick={() => remove(i.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="7" className="table-td text-center text-slate-400 py-8">Aucune intervention</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-2xl">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><Wrench size={18} /> Nouvelle intervention</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="label">Titre *</label><input required className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="label">Description</label><textarea rows="3" className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Site *</label>
                <select required className="input" value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })}>
                  <option value="">-- Choisir --</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="label">Technicien</label>
                <select className="input" value={form.technicianId} onChange={e => setForm({ ...form, technicianId: e.target.value })}>
                  <option value="">-- Choisir --</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
              </div>
              <div><label className="label">Date planifiee *</label><input required type="datetime-local" className="input" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} /></div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Creer</button>
            </div>
          </form>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold">{detail.code} - {detail.title}</h2><button onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">{detail.description || "Pas de description"}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500">Site</p><p className="font-medium">{detail.site && detail.site.name}</p></div>
                <div><p className="text-slate-500">Technicien</p><p className="font-medium">{(detail.technician && detail.technician.fullName) || "-"}</p></div>
                <div><p className="text-slate-500">Planifiee le</p><p className="font-medium">{new Date(detail.scheduledAt).toLocaleString("fr-FR")}</p></div>
                <div><p className="text-slate-500">Statut</p><p className="font-medium">{STATUS[detail.status]}</p></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">Photos ({(detail.photos && detail.photos.length) || 0})</p>
                  <label className="btn-secondary text-xs cursor-pointer">
                    <Camera size={14} /> Ajouter
                    <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) uploadPhoto(detail.id, f); }} />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {detail.photos && detail.photos.map(p => (
                    <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border">
                      <img src={p.url} alt={p.originalName} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
