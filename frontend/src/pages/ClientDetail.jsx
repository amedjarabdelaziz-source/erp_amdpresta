import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { ArrowLeft, Building, Mail, MapPin, Phone } from "lucide-react";

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);

  useEffect(() => { api.get("/clients/" + id).then(r => setClient(r.data)); }, [id]);
  if (!client) return <div className="text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-5">
      <Link to="/clients" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold">
                {client.name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <p className="text-sm text-slate-500 font-mono">{client.code}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {client.phone && <div className="flex items-center gap-2 text-slate-600"><Phone size={14} /> {client.phone}</div>}
            {client.email && <div className="flex items-center gap-2 text-slate-600"><Mail size={14} /> {client.email}</div>}
            {client.city && <div className="flex items-center gap-2 text-slate-600"><MapPin size={14} /> {client.city}</div>}
            {client.ice && <div className="flex items-center gap-2 text-slate-600"><Building size={14} /> ICE: {client.ice}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6">
          <h3 className="font-semibold mb-3">Sites ({(client.sites && client.sites.length) || 0})</h3>
          <div className="space-y-2">
            {client.sites && client.sites.map(s => (
              <div key={s.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span>{s.name}</span>
                <span className="badge bg-slate-100 text-slate-600">{s.type}</span>
              </div>
            ))}
            {(!client.sites || client.sites.length === 0) && <p className="text-sm text-slate-400">Aucun site</p>}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-3">Devis recents</h3>
          <div className="space-y-2">
            {client.devis && client.devis.map(d => (
              <div key={d.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span className="font-mono text-xs">{d.number}</span>
                <span>{d.totalTTC.toFixed(2)} MAD</span>
              </div>
            ))}
            {(!client.devis || client.devis.length === 0) && <p className="text-sm text-slate-400">Aucun devis</p>}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-3">Factures recentes</h3>
          <div className="space-y-2">
            {client.factures && client.factures.map(f => (
              <div key={f.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span className="font-mono text-xs">{f.number}</span>
                <span>{f.totalTTC.toFixed(2)} MAD</span>
              </div>
            ))}
            {(!client.factures || client.factures.length === 0) && <p className="text-sm text-slate-400">Aucune facture</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
