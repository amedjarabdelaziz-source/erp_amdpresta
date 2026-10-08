import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/summary", async (req, res) => {
  const clients = await prisma.client.count();
  const factures = await prisma.facture.findMany();
  const expenses = await prisma.expense.findMany();
  const payments = await prisma.payment.findMany();

  const byMonth = {};
  factures.forEach(f => {
    const key = f.date.getFullYear() + "-" + String(f.date.getMonth() + 1).padStart(2, "0");
    byMonth[key] = byMonth[key] || { invoiced: 0, paid: 0 };
    byMonth[key].invoiced += f.totalTTC;
    byMonth[key].paid += f.paidAmount;
  });

  res.json({
    clients,
    totalInvoiced: factures.reduce((s, f) => s + f.totalTTC, 0),
    totalPaid: factures.reduce((s, f) => s + f.paidAmount, 0),
    totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
    totalPayments: payments.reduce((s, p) => s + p.amount, 0),
    byMonth
  });
});

export default router;
