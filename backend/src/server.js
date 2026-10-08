import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import siteRoutes from "./routes/sites.js";
import bcRoutes from "./routes/bonsCommande.js";
import devisRoutes from "./routes/devis.js";
import blRoutes from "./routes/bonLivraison.js";
import travauxRoutes from "./routes/travaux.js";
import taskRoutes from "./routes/tasks.js";
import interventionRoutes from "./routes/interventions.js";
import userRoutes from "./routes/users.js";
import fournisseurRoutes from "./routes/fournisseurs.js";
import poRoutes from "./routes/purchaseOrders.js";
import factureRoutes from "./routes/factures.js";
import supplierInvoiceRoutes from "./routes/supplierInvoices.js";
import paymentRoutes from "./routes/payments.js";
import expenseRoutes from "./routes/expenses.js";
import dashboardRoutes from "./routes/dashboard.js";
import uploadRoutes from "./routes/uploads.js";
import reportsRoutes from "./routes/reports.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "AMD-PRESTA ERP", ts: Date.now() }));

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/bons-commande", bcRoutes);
app.use("/api/devis", devisRoutes);
app.use("/api/bons-livraison", blRoutes);
app.use("/api/travaux", travauxRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/purchase-orders", poRoutes);
app.use("/api/factures", factureRoutes);
app.use("/api/supplier-invoices", supplierInvoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/reports", reportsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("AMD-PRESTA ERP API running on port " + PORT));
