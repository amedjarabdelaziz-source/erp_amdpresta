import { useEffect, useState } from "react";
import api from "../lib/api";
import { Users, MapPin, FileText, ShoppingCart, Wrench, TrendingUp, AlertCircle, DollarSign, Wallet, ClipboardList } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const StatCard = ({ icon: Icon, label, value, color, sub }) => {
  const c = color || "brand";
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={"w-11 h-11 rounded-lg flex items-center justify-center bg-" + c + "-100 text-" + c + "-600"}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({ title, items }) => (
  <div className="card p-6">
    <h3 className="font-semibold mb-4">{title}</h3>
    <div className="space-y-3">
      {(!items || items.length === 0) && <p className="text-sm text-slate-400">Aucune donnee</p>}
      {items && items.map((it, i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span className="text-slate-700 truncate">{it.label}</span>
          <span className="text-slate-500 font-medium ml-2">{it.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data));
    api.get("/dashboard/revenue-chart").then(r => setChart(r.data));
    api.get("/dashboard/recent-activity").then(r => setActivity(r.data));
  }, []);

  const money = (n) => (n || 0).toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MAD";

  if (!stats) return <div className="text-slate-400">Chargement du tableau de bord...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de l'activite AMD-PRESTA</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Clients" value={stats.counts.clientsCount} />
        <StatCard icon={MapPin} label="Sites" value={stats.counts.sitesCount} />
        <StatCard icon={FileText} label="Devis" value={stats.counts.devisCount} />
        <StatCard icon={ShoppingCart} label="Bons de commande" value={stats.counts.bcCount} />
        <StatCard icon={ClipboardList} label="Taches ouvertes" value={stats.counts.openTasks} color="amber" />
        <StatCard icon={Wrench} label="Interventions aujourd'hui" value={stats.counts.todayInterventions} color="emerald" />
        <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={money(stats.finance.totalRevenue)} color="emerald" />
        <StatCard icon={AlertCircle} label="Impayes" value={money(stats.finance.outstanding)} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Chiffre d'affaires mensuel</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => money(v)} />
              <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Finance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2"><DollarSign size={16} /> Total facture</span>
              <span className="font-semibold">{money(stats.finance.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2"><TrendingUp size={16} /> Total encaisse</span>
              <span className="font-semibold text-emerald-600">{money(stats.finance.totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2"><Wallet size={16} /> Depenses</span>
              <span className="font-semibold text-red-600">{money(stats.finance.totalExpenses)}</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-sm font-medium">Resultat net</span>
              <span className={"font-bold " + (stats.finance.netProfit >= 0 ? "text-emerald-600" : "text-red-600")}>
                {money(stats.finance.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ActivityCard title="Derniers devis" items={activity && activity.recentDevis ? activity.recentDevis.map(d => ({ label: d.number + " - " + d.client.name, value: money(d.totalTTC) })) : []} />
        <ActivityCard title="Dernieres factures" items={activity && activity.recentFactures ? activity.recentFactures.map(f => ({ label: f.number + " - " + f.client.name, value: money(f.totalTTC) })) : []} />
        <ActivityCard title="Interventions recentes" items={activity && activity.recentInterventions ? activity.recentInterventions.map(i => ({ label: i.code + " - " + i.site.name, value: i.status })) : []} />
      </div>
    </div>
  );
}
