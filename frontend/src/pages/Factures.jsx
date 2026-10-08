import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Receipt, DollarSign } from "lucide-react";

const STATUS = {
  DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-600" },
  ISSUED: { label: "Emise", cls: "bg-blue-100 text-blue-700" },
  PARTIALLY_PAID: { label: "Partiel", cls: "bg-amber-100 text-amber-700" },
  PAID: { label: "Payee", cls: "bg-emerald-100 text-emerald-700" },
  OVERDUE: { label: "En retard", cls: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Annulee", cls: "bg-slate-200 text-slate-600" }
};

export default function Factures() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(null);
  const [payment, setPayment] = useState({ amount: 0, method: "BANK_TRANSFER", reference: "", notes: "" });
  const [form, setForm] = useState({ clientId: "", tvaRate: 20, dueDate: "", notes: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] });

  const load = () => api.get("/factures").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/clients").then(r => setClients(r.data)); }, []);

  const updateLine = (i, p) => { const lines = [...form.lines]; lines[i] = { ...lines[i], ...p }; setForm({ ...form, lines }); };
  const addLine = () => setForm({ ...form, lines: [...form.lines, { description: "", quantity: 1, unitPrice: 0 }] });
  const removeLine = (i) => setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });
  const totalHT = form.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const totalTTC = totalHT * (1 + form.tvaRate / 100);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/factures", { ...form, status: "ISSUED" }); toast.success("Facture creee"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments", { ...payment, factureId: payOpen.id });
      toast.success("Paiement enregistre");
      setPayOpen(null); setPayment({ amount: 0, method: "BANK_TRANSFER", reference: "", notes: "" });
      load();
    } catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/factures/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Factures clients</h1><p className="text-sm text-slate-500">Facturation et encaissements</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouvelle facture</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Numero</th><th className="table-th">Client</th><th className="table-th">Date</th><th className="table-th">Total TTC</th><th className="table-th">Paye</th><th className="table-th">Statut</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(f => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{f.number}</td>
                <td className="table-td font-medium">{f.client && f.client.name}</td>
                <td className="table-td">{new Date(f.date).toLocaleDateString("fr-FR")}</td>
                <td className="table-td font-semibold">{f.totalTTC.toFixed(2)} MAD</td>
                <td className="table-td text-emerald-600">{f.paidAmount.toFixed(2)} MAD</td>
                <td className="table-td"><span className={"badge " + ((STATUS[f.status] && STATUS[f.status].cls) || "")}>{(STATUS[f.status] && STATUS[f.status].label) || f.status}</span></td>
                <td className="table-td">
                  <div className="flex justify-end gap-1">
                    {f.status !== "PAID" && (
                      <button onClick={() => { setPayOpen(f); setPayment({ amount: f.totalTTC - f.paidAmount, method: "BANK_TRANSFER", reference: "", notes: "" }); }}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Enregistrer paiement"><DollarSign size={16} /></button>
                    )}
                    <button onClick={() => remove(f.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="7" className="table-td text-center text-slate-400 py-8">Aucune facture</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><Receipt size={18} /> Nouvelle facture</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="label">Client *</label>
                  <select required className="input" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                    <option value="">-- Choisir --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="label">TVA (%)</label><input type="number" className="input" value={form.tvaRate} onChange={e => setForm({ ...form, tvaRate: Number(e.target.value) })} /></div>
                <div><label className="label">Echeance</label><input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
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
              <button type="submit" className="btn-primary">Emettre facture</button>
            </div>
          </form>
        </div>
      )}

      {payOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submitPayment} className="card w-full max-w-md">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold">Enregistrer paiement</h2><button type="button" onClick={() => setPayOpen(null)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div><p className="text-sm text-slate-500">Facture</p><p className="font-medium">{payOpen.number}</p></div>
              <div><label className="label">Montant (MAD) *</label><input type="number" step="0.01" required className="input" value={payment.amount} onChange={e => setPayment({ ...payment, amount: Number(e.target.value) })} /></div>
              <div><label className="label">Methode</label>
                <select className="input" value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })}>
                  <option value="CASH">Especes</option><option value="BANK_TRANSFER">Virement</option><option value="CHECK">Cheque</option><option value="CARD">Carte</option><option value="OTHER">Autre</option>
                </select>
              </div>
              <div><label className="label">Reference</label><input className="input" value={payment.reference} onChange={e => setPayment({ ...payment, reference: e.target.value })} /></div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setPayOpen(null)}>Annuler</button>
              <button type="submit" className="btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
