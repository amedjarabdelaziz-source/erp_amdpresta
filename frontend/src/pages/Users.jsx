import { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, UserCog, Shield } from "lucide-react";

const ROLES = { ADMIN: "Administrateur", MANAGER: "Manager", TECHNICIAN: "Technicien", ACCOUNTANT: "Comptable", CLIENT: "Client" };
const ROLE_CLS = { ADMIN: "bg-red-100 text-red-700", MANAGER: "bg-purple-100 text-purple-700", TECHNICIAN: "bg-blue-100 text-blue-700", ACCOUNTANT: "bg-emerald-100 text-emerald-700", CLIENT: "bg-slate-100 text-slate-600" };

export default function Users() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "TECHNICIAN", phone: "", active: true });

  const load = () => api.get("/users").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/users", form); toast.success("Utilisateur cree"); setOpen(false); load(); }
    catch { toast.error("Erreur"); }
  };

  const remove = async (id) => { if (!confirm("Supprimer ?")) return; await api.delete("/users/" + id); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Utilisateurs</h1><p className="text-sm text-slate-500">Gestion des comptes et roles</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Nouvel utilisateur</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr><th className="table-th">Nom</th><th className="table-th">Email</th><th className="table-th">Role</th><th className="table-th">Telephone</th><th className="table-th">Statut</th><th className="table-th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="table-td font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">{u.fullName[0]}</div>
                    {u.fullName}
                  </div>
                </td>
                <td className="table-td">{u.email}</td>
                <td className="table-td"><span className={"badge " + (ROLE_CLS[u.role] || "")}><Shield size={12} className="mr-1" />{ROLES[u.role]}</span></td>
                <td className="table-td">{u.phone || "-"}</td>
                <td className="table-td"><span className={"badge " + (u.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>{u.active ? "Actif" : "Inactif"}</span></td>
                <td className="table-td text-right"><button onClick={() => remove(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="card w-full max-w-md">
            <div className="p-6 border-b flex justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><UserCog size={18} /> Nouvel utilisateur</h2><button type="button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="label">Nom complet *</label><input required className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
              <div><label className="label">Email *</label><input type="email" required className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Mot de passe *</label><input type="password" required minLength="6" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div><label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="label">Telephone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
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
