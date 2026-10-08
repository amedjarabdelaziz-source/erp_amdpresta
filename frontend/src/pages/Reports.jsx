import { useEffect, useState } from "react";
import api from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/reports/summary").then(r => setData(r.data)); }, []);
  if (!data) return <div className="text-slate-400">Chargement...</div>;

  const money = (n) => (n || 0).toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MAD";
  const chartData = Object.entries(data.byMonth).map(([k, v]) => ({ month: k, invoiced: v.invoiced, paid: v.paid }));

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Rapports</h1><p className="text-sm text-slate-500">Indicateurs de performance</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5"><p className="text-sm text-slate-500">Clients</p><p className="text-2xl font-bold">{data.clients}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Total facture</p><p className="text-2xl font-bold text-brand-600">{money(data.totalInvoiced)}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Total encaisse</p><p className="text-2xl font-bold text-emerald-600">{money(data.totalPaid)}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Total depenses</p><p className="text-2xl font-bold text-red-600">{money(data.totalExpenses)}</p></div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Facturation vs Encaissement</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => money(v)} />
            <Bar dataKey="invoiced" fill="#2563eb" radius={[6, 6, 0, 0]} name="Facture" />
            <Bar dataKey="paid" fill="#10b981" radius={[6, 6, 0, 0]} name="Encaisse" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
