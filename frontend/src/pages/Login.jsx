import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Wrench } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@amd-presta.ma");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Connexion reussie");
      navigate("/");
    } catch (err) {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-brand-700 to-brand-900 items-center justify-center text-white p-12">
        <div>
          <Wrench size={64} className="mb-6" />
          <h1 className="text-4xl font-bold mb-3">AMD-PRESTA</h1>
          <p className="text-lg text-brand-100 max-w-md">
            Plateforme ERP tout-en-un pour la maintenance technique, le froid industriel et les services multi-techniques.
          </p>
          <ul className="mt-8 space-y-2 text-brand-100">
            <li>Gestion clients, sites et magasins</li>
            <li>Devis, bons de commande et factures</li>
            <li>Planning techniciens et interventions</li>
            <li>Suivi achats, paiements et depenses</li>
          </ul>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md card p-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Wrench className="text-brand-600" />
            <span className="text-xl font-bold">AMD-PRESTA</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Connexion</h2>
          <p className="text-sm text-slate-500 mb-6">Accedez a votre espace de travail</p>

          <div className="mb-4">
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="label">Mot de passe</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="mt-6 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Comptes de demonstration :</p>
            <p>admin@amd-presta.ma / admin123</p>
            <p>manager@amd-presta.ma / admin123</p>
            <p>tech@amd-presta.ma / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
