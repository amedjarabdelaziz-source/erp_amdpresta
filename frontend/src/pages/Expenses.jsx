import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Wallet } from "lucide-react";

const METHODS = { CASH: "Especes", BANK_TRANSFER: "Virement", CHECK: "Cheque", CARD: "Carte", OTHER: "Autre" };
const CATEGORIES = ["Carburant", "Fournitures", "Maintenance", "Loyer", "Salaires", "Transport", "Autre"];

export default function Expenses() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Fournitures", description: "", amount: 0, method: "CASH", date: new Date().toISOString().slice(0, 10), reference: "" });

  const load = () => api.get("/expenses").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/expenses", form); toast.success("Depense enregistree"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/expenses/" + id); load(); };

  const total = items.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Depenses</h1><p className="text-sm text-slate-500">Charges et frais divers</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouvelle depense</button>
      </div>

      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Total des depenses</p>
          <p className="text-2xl font-bold text-red-600">{total.toFixed(2)} MAD</p>
        </div>
        <Wallet className="text-red-500" size={36} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Numero</th><th className="table-th">Date</th><th className="table-th">Categorie</th><th className="table-th">Description</th><th className="table-th">Montant</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{e.number}</td>
                <td className="table-td">{new Date(e.date).toLocaleDateString("fr-FR")}</td>
                <td className="table-td"><span className="badge bg-slate-100 text-slate-600">{e.category}</span></td>
                <td className="table-td">{e.description}</td>
                <td className="table-td font-semibold text-red-600">{e.amount.toFixed(2)} MAD</td>
                <td className="table-td text-right"><button onClick={() => remove(e.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="table-td text-center text-slate-400 py-8">Aucune depense</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-md">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold">Nouvelle depense</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="label">Categorie</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="label">Description *</label><input required className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Montant (MAD) *</label><input type="number" step="0.01" required className="input" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><label className="label">Methode</label>
                <select className="input" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                  {Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
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
