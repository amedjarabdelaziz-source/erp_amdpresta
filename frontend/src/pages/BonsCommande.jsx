import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, ShoppingCart } from "lucide-react";

const STATUS = {
  DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-600" },
  SENT: { label: "Envoye", cls: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "Accepte", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Refuse", cls: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Termine", cls: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Annule", cls: "bg-slate-200 text-slate-600" }
};

export default function BonsCommande() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", tvaRate: 20, notes: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] });

  const load = () => api.get("/bons-commande").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/clients").then(r => setClients(r.data)); }, []);

  const updateLine = (i, p) => { const lines = [...form.lines]; lines[i] = { ...lines[i], ...p }; setForm({ ...form, lines }); };
  const addLine = () => setForm({ ...form, lines: [...form.lines, { description: "", quantity: 1, unitPrice: 0 }] });
  const removeLine = (i) => setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });
  const totalHT = form.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const totalTTC = totalHT * (1 + form.tvaRate / 100);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/bons-commande", form); toast.success("BC cree"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const updateStatus = async (id, status) => { await api.put("/bons-commande/" + id, { status }); load(); };
  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/bons-commande/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Bons de commande</h1><p className="text-sm text-slate-500">Suivi des commandes clients</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouveau BC</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Numero</th><th className="table-th">Client</th><th className="table-th">Date</th><th className="table-th">Total TTC</th><th className="table-th">Statut</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(b => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{b.number}</td>
                <td className="table-td font-medium">{b.client && b.client.name}</td>
                <td className="table-td">{new Date(b.date).toLocaleDateString("fr-FR")}</td>
                <td className="table-td font-semibold">{b.totalTTC.toFixed(2)} MAD</td>
                <td className="table-td">
                  <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)} className="badge bg-slate-100 text-slate-600 border-0 cursor-pointer">
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </td>
                <td className="table-td text-right">
                  <button onClick={() => remove(b.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="table-td text-center text-slate-400 py-8">Aucun BC</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><ShoppingCart size={18} /> Nouveau BC</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Client *</label>
                  <select required className="input" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                    <option value="">-- Choisir --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="label">TVA (%)</label><input type="number" className="input" value={form.tvaRate} onChange={e => setForm({ ...form, tvaRate: Number(e.target.value) })} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="label mb-0">Lignes</label>
                  <button type="button" onClick={addLine} className="btn-ghost text-xs"><Plus size={14} /> Ajouter</button>
                </div>
                {form.lines.map((l, i) => (
                  <div key={i} className="flex gap-2 items-start mb-2">
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
