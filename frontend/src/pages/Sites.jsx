import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Search, Trash2, MapPin } from "lucide-react";

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", clientId: "", type: "MAGASIN", city: "", address: "", contactName: "", contactPhone: "" });

  const load = () => api.get("/sites?q=" + q).then(r => setSites(r.data));
  useEffect(() => { load(); }, [q]);
  useEffect(() => { api.get("/clients").then(r => setClients(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/sites", form); toast.success("Site cree"); setShowModal(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer ce site ?")) return;
    await api.delete("/sites/" + id); load(); toast.success("Supprime");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sites et Magasins</h1>
          <p className="text-sm text-slate-500">Lieux d'intervention</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Nouveau site</button>
      </div>

      <div className="card">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Rechercher..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="table-th">Code</th>
                <th className="table-th">Nom</th>
                <th className="table-th">Client</th>
                <th className="table-th">Type</th>
                <th className="table-th">Ville</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sites.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="table-td font-mono text-xs">{s.code}</td>
                  <td className="table-td font-medium">
                    <div className="flex items-center gap-2"><MapPin size={14} className="text-brand-500" /> {s.name}</div>
                  </td>
                  <td className="table-td">{s.client && s.client.name}</td>
                  <td className="table-td"><span className="badge bg-brand-100 text-brand-700">{s.type}</span></td>
                  <td className="table-td">{s.city}</td>
                  <td className="table-td">
                    <button onClick={() => remove(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded float-right"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {sites.length === 0 && <tr><td colSpan="6" className="table-td text-center text-slate-400 py-8">Aucun site</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-2xl">
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">Nouveau site</h2></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="label">Nom *</label><input required className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Client *</label>
                <select required className="input" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">-- Choisir --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option>MAGASIN</option><option>ENTREPOT</option><option>BUREAU</option><option>USINE</option><option>AUTRE</option>
                </select>
              </div>
              <div><label className="label">Ville</label><input className="input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><label className="label">Contact</label><input className="input" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} /></div>
              <div><label className="label">Telephone</label><input className="input" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="label">Adresse</label><textarea rows="2" className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
