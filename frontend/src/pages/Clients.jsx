import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

const emptyForm = { name: "", ice: "", rc: "", city: "", phone: "", email: "", contactName: "", address: "" };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/clients?q=" + q).then(r => setClients(r.data));
  useEffect(() => { load(); }, [q]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put("/clients/" + editing, form);
      else await api.post("/clients", form);
      toast.success("Enregistre");
      setShowModal(false); setForm(emptyForm); setEditing(null); load();
    } catch { toast.error("Erreur"); }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer ce client ?")) return;
    await api.delete("/clients/" + id);
    toast.success("Supprime"); load();
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ name: c.name, ice: c.ice || "", rc: c.rc || "", city: c.city || "", phone: c.phone || "", email: c.email || "", contactName: c.contactName || "", address: c.address || "" });
    setShowModal(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-slate-500">Gestion du portefeuille clients</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setShowModal(true); }} className="btn-primary">
          <Plus size={16} /> Nouveau client
        </button>
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
                <th className="table-th">Ville</th>
                <th className="table-th">Contact</th>
                <th className="table-th">Sites</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="table-td font-mono text-xs">{c.code}</td>
                  <td className="table-td font-medium">{c.name}</td>
                  <td className="table-td">{c.city || "-"}</td>
                  <td className="table-td">
                    <div className="text-sm">{c.contactName || "-"}</div>
                    <div className="text-xs text-slate-500">{c.phone}</div>
                  </td>
                  <td className="table-td">{(c._count && c._count.sites) || 0}</td>
                  <td className="table-td">
                    <div className="flex justify-end gap-1">
                      <Link to={"/clients/" + c.id} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><Eye size={16} /></Link>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-brand-600 hover:bg-brand-50 rounded"><Edit size={16} /></button>
                      <button onClick={() => remove(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan="6" className="table-td text-center text-slate-400 py-8">Aucun client</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">{editing ? "Modifier" : "Nouveau"} client</h2></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="label">Nom *</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">ICE</label><input className="input" value={form.ice} onChange={e => setForm({ ...form, ice: e.target.value })} /></div>
              <div><label className="label">RC</label><input className="input" value={form.rc} onChange={e => setForm({ ...form, rc: e.target.value })} /></div>
              <div><label className="label">Ville</label><input className="input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><label className="label">Telephone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Contact</label><input className="input" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="label">Adresse</label><textarea className="input" rows="2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
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
