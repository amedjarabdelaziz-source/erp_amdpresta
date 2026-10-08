import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, MapPin, FileText, ShoppingCart, Truck,
  HardHat, ClipboardList, Wrench, CalendarDays, Building2, Package,
  Receipt, CreditCard, Wallet, BarChart3, UserCog, LogOut, Menu, X, Bell
} from "lucide-react";

const navItems = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { section: "Commercial" },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/sites", label: "Sites & Magasins", icon: MapPin },
  { to: "/devis", label: "Devis", icon: FileText },
  { to: "/bons-commande", label: "Bons de commande", icon: ShoppingCart },
  { to: "/bons-livraison", label: "Bons de livraison", icon: Truck },
  { section: "Operations" },
  { to: "/travaux", label: "Travaux", icon: HardHat },
  { to: "/tasks", label: "Taches", icon: ClipboardList },
  { to: "/interventions", label: "Interventions", icon: Wrench },
  { to: "/planning", label: "Planning", icon: CalendarDays },
  { section: "Achats" },
  { to: "/fournisseurs", label: "Fournisseurs", icon: Building2 },
  { to: "/purchase-orders", label: "Commandes fourn.", icon: Package },
  { to: "/supplier-invoices", label: "Factures fourn.", icon: Receipt },
  { section: "Finance" },
  { to: "/factures", label: "Factures clients", icon: Receipt },
  { to: "/payments", label: "Paiements", icon: CreditCard },
  { to: "/expenses", label: "Depenses", icon: Wallet },
  { to: "/reports", label: "Rapports", icon: BarChart3 },
  { section: "Administration" },
  { to: "/users", label: "Utilisateurs", icon: UserCog }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className={(open ? "translate-x-0 " : "-translate-x-full lg:translate-x-0 ") + "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transform transition-transform"}>
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">AMD-PRESTA</h1>
            <p className="text-xs text-slate-400">ERP Multi-Services</p>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item, i) => {
            if (item.section) return <div key={i} className="px-6 mt-4 mb-1 text-xs font-semibold text-slate-500 uppercase">{item.section}</div>;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  "flex items-center gap-3 px-6 py-2.5 text-sm transition " +
                  (isActive ? "bg-brand-600 text-white border-r-2 border-brand-400" : "text-slate-300 hover:bg-slate-800 hover:text-white")
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
              {user && user.fullName ? user.fullName[0] : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user && user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user && user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
            <LogOut size={16} /> Deconnexion
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-8 gap-4">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu size={22} /></button>
          <h2 className="text-lg font-semibold text-slate-800 flex-1">AMD-PRESTA ERP</h2>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Bell size={18} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
