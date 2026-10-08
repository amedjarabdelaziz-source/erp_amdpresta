import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, FileText, ArrowRight } from "lucide-react";

const STATUS = {
  DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-600" },
  SENT: { label: "Envoye", cls: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "Accepte", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Refuse", cls: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Termine", cls: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Annule", cls: "bg-slate-200 text-slate-600" }
};

export default function Devis() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ clientId: "", validUntil: "", tvaRate: 20, notes: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] });

  const load = () => api.get("/devis").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/clients").then(r => setClients(r.data)); }, []);

  const updateLine = (i, patch) => {
    const lines = [...form.lines];
    lines[i] = { ...lines[i], ...patch };
    setForm({ ...form, lines });
  };
  const addLine = () => setForm({ ...form, lines: [...form.lines, { description: "", quantity: 1, unitPrice: 0 }] });
  const removeLine = (i) => setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });

  const totalHT = form.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const totalTTC = totalHT * (1 + form.tvaRate / 100);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/devis", form);
      toast.success("Devis cree");
      setOpen(false);
      setForm({ clientId: "", validUntil: "", tvaRate: 20, notes: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] });
      load();
    } catch { toast.error("Erreur"); }
  };

  const convertToBC = async (id) => {
    try { await api.post("/devis/" + id + "/convert-to-bc"); toast.success("Converti en bon de commande"); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer ce devis ?")) return;
    await api.delete("/devis/" + id); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Devis</h1><p className="text-sm text-slate-500">Gestion des devis clients</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouveau devis</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="table-th">Numero</th>
              <th className="table-th">Client</th>
              <th className="table-th">Date</th>
              <th className="table-th">Total TTC</th>
              <th className="table-th">Statut</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="table-td font-mono text-xs">{d.number}</td>
                <td className="table-td font-medium">{d.client && d.client.name}</td>
                <td className="table-td">{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                <td className="table-td font-semibold">{d.totalTTC.toFixed(2)} MAD</td>
                <td className="table-td"><span className={"badge " + ((STATUS[d.status] && STATUS[d.status].cls) || "")}>{(STATUS[d.status] && STATUS[d.status].label) || d.status}</span></td>
                <td className="table-td">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setDetail(d)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><FileText size={16} /></button>
                    <button onClick={() => convertToBC(d.id)} title="Convertir en BC" className="p-1.5 text-brand-600 hover:bg-brand-50 rounded"><ArrowRight size={16} /></button>
                    <button onClick={() => remove(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="table-td text-center text-slate-400 py-8">Aucun devis</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Nouveau devis</h2>
              <button type="button" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="label">Client *</label>
                  <select required className="input" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                    <option value="">-- Choisir --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="label">Valide jusqu'au</label><input type="date" className="input" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} /></div>
                <div><label className="label">TVA (%)</label><input type="number" className="input" value={form.tvaRate} onChange={e => setForm({ ...form, tvaRate: Number(e.target.value) })} /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Lignes</label>
                  <button type="button" onClick={addLine} className="btn-ghost text-xs"><Plus size={14} /> Ajouter</button>
                </div>
                <div className="space-y-2">
                  {form.lines.map((l, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input className="input flex-1" placeholder="Description" value={l.description} onChange={e => updateLine(i, { description: e.target.value })} required />
                      <input type="number" className="input w-20" placeholder="Qte" value={l.quantity} onChange={e => updateLine(i, { quantity: Number(e.target.value) })} />
                      <input type="number" className="input w-28" placeholder="PU" value={l.unitPrice} onChange={e => updateLine(i, { unitPrice: Number(e.target.value) })} />
                      <div className="w-28 text-sm font-medium py-2">{(l.quantity * l.unitPrice).toFixed(2)}</div>
                      <button type="button" onClick={() => removeLine(i)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div><label className="label">Notes</label><textarea rows="2" className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-1">
                <div className="flex justify-between text-sm"><span>Total HT</span><span>{totalHT.toFixed(2)} MAD</span></div>
                <div className="flex justify-between text-sm"><span>TVA ({form.tvaRate}%)</span><span>{(totalTTC - totalHT).toFixed(2)} MAD</span></div>
                <div className="flex justify-between font-bold border-t pt-2"><span>Total TTC</span><span>{totalTTC.toFixed(2)} MAD</span></div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Creer devis</button>
            </div>
          </form>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2"><FileText size={18} /> {detail.number}</h2>
              <button onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><p className="text-sm text-slate-500">Client</p><p className="font-medium">{detail.client && detail.client.name}</p></div>
              <table className="w-full">
                <thead className="bg-slate-50"><tr><th className="table-th">Description</th><th className="table-th">Qte</th><th className="table-th">PU</th><th className="table-th text-right">Total</th></tr></thead>
                <tbody className="divide-y">
                  {detail.lines.map(l => (
                    <tr key={l.id}><td className="table-td">{l.description}</td><td className="table-td">{l.quantity}</td><td className="table-td">{l.unitPrice}</td><td className="table-td text-right">{l.total.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end gap-8 pt-3 border-t">
                <div className="text-right"><p className="text-sm text-slate-500">Total HT</p><p>{detail.totalHT.toFixed(2)} MAD</p></div>
                <div className="text-right"><p className="text-sm text-slate-500">Total TTC</p><p className="text-lg font-bold">{detail.totalTTC.toFixed(2)} MAD</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
