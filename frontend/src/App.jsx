import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Sites from "./pages/Sites";
import Devis from "./pages/Devis";
import BonsCommande from "./pages/BonsCommande";
import BonsLivraison from "./pages/BonsLivraison";
import Travaux from "./pages/Travaux";
import Tasks from "./pages/Tasks";
import Interventions from "./pages/Interventions";
import Planning from "./pages/Planning";
import Users from "./pages/Users";
import Fournisseurs from "./pages/Fournisseurs";
import PurchaseOrders from "./pages/PurchaseOrders";
import Factures from "./pages/Factures";
import SupplierInvoices from "./pages/SupplierInvoices";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="sites" element={<Sites />} />
        <Route path="devis" element={<Devis />} />
        <Route path="bons-commande" element={<BonsCommande />} />
        <Route path="bons-livraison" element={<BonsLivraison />} />
        <Route path="travaux" element={<Travaux />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="interventions" element={<Interventions />} />
        <Route path="planning" element={<Planning />} />
        <Route path="fournisseurs" element={<Fournisseurs />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="factures" element={<Factures />} />
        <Route path="supplier-invoices" element={<SupplierInvoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}
