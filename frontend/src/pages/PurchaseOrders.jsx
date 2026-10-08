import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Package } from "lucide-react";

export default function PurchaseOrders() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fournisseurId: "", tvaRate: 20, notes: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] });

  const load = () => api.get("/purchase-orders").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/fournisseurs").then(r => setSuppliers(r.data)); }, []);

  const updateLine = (i, p) => { const lines = [...form.lines]; lines[i] = { ...lines[i], ...p }; setForm({ ...form, lines }); };
  const addLine = () => setForm({ ...form, lines: [...form.lines, { description: "", quantity: 1, unitPrice: 0 }] });
  const removeLine = (i) => setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });
  const totalHT = form.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const totalTTC = totalHT * (1 + form.tvaRate / 100);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/purchase-orders", form); toast.success("PO cree"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/purchase-orders/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Commandes fournisseurs</h1><p className="text-sm text-slate-500">Achats et approvisionnements</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouvelle commande</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Numero</th><th className="table-th">Fournisseur</th><th className="table-th">Date</th><th className="table-th">Total TTC</th><th className="table-th">Statut</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{p.number}</td>
                <td className="table-td font-medium">{p.fournisseur && p.fournisseur.name}</td>
                <td className="table-td">{new Date(p.date).toLocaleDateString("fr-FR")}</td>
                <td className="table-td font-semibold">{p.totalTTC.toFixed(2)} MAD</td>
                <td className="table-td"><span className="badge bg-slate-100 text-slate-600">{p.status}</span></td>
                <td className="table-td text-right"><button onClick={() => remove(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="table-td text-center text-slate-400 py-8">Aucune commande</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><Package size={18} /> Nouvelle commande</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Fournisseur *</label>
                  <select required className="input" value={form.fournisseurId} onChange={e => setForm({ ...form, fournisseurId: e.target.value })}>
                    <option value="">-- Choisir --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="label">TVA (%)</label><input type="number" className="input" value={form.tvaRate} onChange={e => setForm({ ...form, tvaRate: Number(e.target.value) })} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="label mb-0">Lignes</label>
                  <button type="button" onClick={addLine} className="btn-ghost text-xs"><Plus size={14} /> Ajouter</button>
                </div>
                {form.lines.map((l, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="input flex-1" placeholder="Description" value={l.description} onChange={e => updateLine(i, { description: e.target.value })} required />
                    <input type="number" className="input w-20" value={l.quantity} onChange={e => updateLine(i, { quantity: Number(e.target.value) })} />
                    <input type="number" className="input w-28" value={l.unitPrice} onChange={e => updateLine(i, { unitPrice: Number(e.target.value) })} />
                    <button type="button" onClick={() => removeLine(i)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between text-sm"><span>Total HT</span><span>{totalHT.toFixed(2)} MAD</span></div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total TTC</span><span>{totalTTC.toFixed(2)} MAD</span></div>
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
