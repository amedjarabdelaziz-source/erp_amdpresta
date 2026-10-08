import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Building2 } from "lucide-react";

export default function Fournisseurs() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", ice: "", phone: "", email: "", address: "" });

  const load = () => api.get("/fournisseurs").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/fournisseurs", form); toast.success("Fournisseur cree"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/fournisseurs/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Fournisseurs</h1><p className="text-sm text-slate-500">Base fournisseurs</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouveau fournisseur</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Code</th><th className="table-th">Nom</th><th className="table-th">ICE</th><th className="table-th">Telephone</th><th className="table-th">Email</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(f => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{f.code}</td>
                <td className="table-td font-medium">
                  <div className="flex items-center gap-2"><Building2 size={14} className="text-brand-500" /> {f.name}</div>
                </td>
                <td className="table-td">{f.ice || "-"}</td>
                <td className="table-td">{f.phone || "-"}</td>
                <td className="table-td">{f.email || "-"}</td>
                <td className="table-td text-right"><button onClick={() => remove(f.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="table-td text-center text-slate-400 py-8">Aucun fournisseur</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-xl">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold">Nouveau fournisseur</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="label">Nom *</label><input required className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">ICE</label><input className="input" value={form.ice} onChange={e => setForm({ ...form, ice: e.target.value })} /></div>
              <div><label className="label">Telephone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="label">Adresse</label><textarea rows="2" className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
