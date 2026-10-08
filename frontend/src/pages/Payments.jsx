import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, CreditCard } from "lucide-react";

const METHODS = { CASH: "Especes", BANK_TRANSFER: "Virement", CHECK: "Cheque", CARD: "Carte", OTHER: "Autre" };

export default function Payments() {
  const [items, setItems] = useState([]);
  const [factures, setFactures] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ factureId: "", amount: 0, method: "BANK_TRANSFER", reference: "", notes: "" });

  const load = () => api.get("/payments").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/factures").then(r => setFactures(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/payments", form); toast.success("Paiement enregistre"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/payments/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Paiements</h1><p className="text-sm text-slate-500">Encaissements recus</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouveau paiement</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Numero</th><th className="table-th">Date</th><th className="table-th">Facture</th><th className="table-th">Montant</th><th className="table-th">Methode</th><th className="table-th">Reference</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{p.number}</td>
                <td className="table-td">{new Date(p.date).toLocaleDateString("fr-FR")}</td>
                <td className="table-td">{(p.facture && p.facture.number) || "-"}</td>
                <td className="table-td font-semibold text-emerald-600">{p.amount.toFixed(2)} MAD</td>
                <td className="table-td">{METHODS[p.method]}</td>
                <td className="table-td">{p.reference || "-"}</td>
                <td className="table-td text-right"><button onClick={() => remove(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="7" className="table-td text-center text-slate-400 py-8">Aucun paiement</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-md">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard size={18} /> Nouveau paiement</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="label">Facture *</label>
                <select required className="input" value={form.factureId} onChange={e => setForm({ ...form, factureId: e.target.value })}>
                  <option value="">-- Choisir --</option>{factures.map(f => <option key={f.id} value={f.id}>{f.number} - {f.client && f.client.name}</option>)}
                </select>
              </div>
              <div><label className="label">Montant (MAD) *</label><input type="number" step="0.01" required className="input" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div><label className="label">Methode</label>
                <select className="input" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                  {Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="label">Reference</label><input className="input" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
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
