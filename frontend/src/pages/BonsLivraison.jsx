import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Truck } from "lucide-react";

export default function BonsLivraison() {
  const [items, setItems] = useState([]);
  const [bcs, setBcs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bcId: "", deliveredBy: "", receivedBy: "", notes: "", lines: [{ description: "", quantity: 1, unit: "U" }] });

  const load = () => api.get("/bons-livraison").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/bons-commande").then(r => setBcs(r.data)); }, []);

  const updateLine = (i, p) => { const lines = [...form.lines]; lines[i] = { ...lines[i], ...p }; setForm({ ...form, lines }); };
  const addLine = () => setForm({ ...form, lines: [...form.lines, { description: "", quantity: 1, unit: "U" }] });
  const removeLine = (i) => setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/bons-livraison", form); toast.success("BL cree"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/bons-livraison/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Bons de livraison</h1><p className="text-sm text-slate-500">Livraisons de materiel</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouveau BL</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Numero</th><th className="table-th">BC lie</th><th className="table-th">Date</th><th className="table-th">Livre par</th><th className="table-th">Recu par</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(b => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{b.number}</td>
                <td className="table-td">{(b.bc && b.bc.number) || "-"}</td>
                <td className="table-td">{new Date(b.date).toLocaleDateString("fr-FR")}</td>
                <td className="table-td">{b.deliveredBy || "-"}</td>
                <td className="table-td">{b.receivedBy || "-"}</td>
                <td className="table-td text-right"><button onClick={() => remove(b.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="table-td text-center text-slate-400 py-8">Aucun BL</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-2xl">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><Truck size={18} /> Nouveau BL</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="label">BC lie</label>
                  <select className="input" value={form.bcId} onChange={e => setForm({ ...form, bcId: e.target.value })}>
                    <option value="">Aucun</option>{bcs.map(b => <option key={b.id} value={b.id}>{b.number}</option>)}
                  </select>
                </div>
                <div><label className="label">Livre par</label><input className="input" value={form.deliveredBy} onChange={e => setForm({ ...form, deliveredBy: e.target.value })} /></div>
                <div><label className="label">Recu par</label><input className="input" value={form.receivedBy} onChange={e => setForm({ ...form, receivedBy: e.target.value })} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="label mb-0">Lignes</label>
                  <button type="button" onClick={addLine} className="btn-ghost text-xs"><Plus size={14} /> Ajouter</button>
                </div>
                {form.lines.map((l, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="input flex-1" placeholder="Description" value={l.description} onChange={e => updateLine(i, { description: e.target.value })} required />
                    <input type="number" className="input w-20" value={l.quantity} onChange={e => updateLine(i, { quantity: Number(e.target.value) })} />
                    <input className="input w-20" value={l.unit} onChange={e => updateLine(i, { unit: e.target.value })} />
                    <button type="button" onClick={() => removeLine(i)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
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
