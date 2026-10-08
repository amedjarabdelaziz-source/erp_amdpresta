import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Receipt } from "lucide-react";

const STATUS = { DRAFT: "Brouillon", ISSUED: "Emise", PARTIALLY_PAID: "Partiel", PAID: "Payee", OVERDUE: "En retard", CANCELLED: "Annulee" };

export default function SupplierInvoices() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fournisseurId: "", totalHT: 0, tvaRate: 20, dueDate: "", status: "ISSUED" });

  const load = () => api.get("/supplier-invoices").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/fournisseurs").then(r => setSuppliers(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/supplier-invoices", form); toast.success("Facture creee"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/supplier-invoices/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Factures fournisseurs</h1><p className="text-sm text-slate-500">Factures d'achat</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouvelle facture</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Numero</th><th className="table-th">Fournisseur</th><th className="table-th">Date</th><th className="table-th">Total TTC</th><th className="table-th">Paye</th><th className="table-th">Statut</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(f => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{f.number}</td>
                <td className="table-td font-medium">{f.fournisseur && f.fournisseur.name}</td>
                <td className="table-td">{new Date(f.date).toLocaleDateString("fr-FR")}</td>
                <td className="table-td font-semibold">{f.totalTTC.toFixed(2)} MAD</td>
                <td className="table-td text-emerald-600">{f.paidAmount.toFixed(2)} MAD</td>
                <td className="table-td"><span className="badge bg-slate-100 text-slate-600">{STATUS[f.status]}</span></td>
                <td className="table-td text-right"><button onClick={() => remove(f.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="7" className="table-td text-center text-slate-400 py-8">Aucune facture</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-xl">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><Receipt size={18} /> Nouvelle facture</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="label">Fournisseur *</label>
                <select required className="input" value={form.fournisseurId} onChange={e => setForm({ ...form, fournisseurId: e.target.value })}>
                  <option value="">-- Choisir --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="label">Total HT (MAD)</label><input type="number" step="0.01" className="input" value={form.totalHT} onChange={e => setForm({ ...form, totalHT: Number(e.target.value) })} /></div>
              <div><label className="label">TVA (%)</label><input type="number" className="input" value={form.tvaRate} onChange={e => setForm({ ...form, tvaRate: Number(e.target.value) })} /></div>
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
