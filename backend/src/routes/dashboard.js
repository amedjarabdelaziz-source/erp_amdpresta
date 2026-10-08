import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/stats", async (req, res) => {
  const clientsCount = await prisma.client.count();
  const sitesCount = await prisma.site.count();
  const devisCount = await prisma.devis.count();
  const bcCount = await prisma.bonCommande.count();
  const facturesCount = await prisma.facture.count();
  const tasksCount = await prisma.task.count();
  const interventionsCount = await prisma.intervention.count();
  const openTasks = await prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } });
  const todayInterventions = await prisma.intervention.count({
    where: {
      scheduledAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }
  });

  const invoices = await prisma.facture.findMany();
  const totalRevenue = invoices.reduce((s, f) => s + f.totalTTC, 0);
  const totalPaid = invoices.reduce((s, f) => s + f.paidAmount, 0);
  const expenses = await prisma.expense.findMany();
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  res.json({
    counts: { clientsCount, sitesCount, devisCount, bcCount, facturesCount, tasksCount, interventionsCount, openTasks, todayInterventions },
    finance: { totalRevenue, totalPaid, outstanding: totalRevenue - totalPaid, totalExpenses, netProfit: totalPaid - totalExpenses }
  });
});

router.get("/recent-activity", async (req, res) => {
  const recentDevis = await prisma.devis.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: true } });
  const recentFactures = await prisma.facture.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: true } });
  const recentInterventions = await prisma.intervention.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { site: true, technician: true } });
  res.json({ recentDevis, recentFactures, recentInterventions });
});

router.get("/revenue-chart", async (req, res) => {
  const factures = await prisma.facture.findMany();
  const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
  const year = new Date().getFullYear();
  const data = months.map((m, i) => ({
    month: m,
    revenue: factures.filter(f => f.date.getFullYear() === year && f.date.getMonth() === i).reduce((s, f) => s + f.totalTTC, 0)
  }));
  res.json(data);
});

export default router;
