import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

const computeTotals = (lines, tvaRate) => {
  const rate = tvaRate || 20;
  const totalHT = lines.reduce((s, l) => s + Number(l.quantity) * Number(l.unitPrice), 0);
  return { totalHT, totalTTC: totalHT * (1 + rate / 100) };
};

router.get("/", async (req, res) => {
  const list = await prisma.bonCommande.findMany({ include: { client: true, lines: true }, orderBy: { date: "desc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const lines = body.lines || [];
  const tvaRate = body.tvaRate || 20;
  const count = await prisma.bonCommande.count();
  const number = body.number || "BC-" + new Date().getFullYear() + "-" + String(count + 1).padStart(5, "0");
  const totals = computeTotals(lines, tvaRate);
  const bc = await prisma.bonCommande.create({
    data: {
      clientId: body.clientId,
      notes: body.notes,
      number, tvaRate,
      totalHT: totals.totalHT,
      totalTTC: totals.totalTTC,
      lines: { create: lines.map(l => ({ description: l.description, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), total: Number(l.quantity) * Number(l.unitPrice) })) }
    },
    include: { lines: true, client: true }
  });
  res.status(201).json(bc);
});

router.put("/:id", async (req, res) => {
  const bc = await prisma.bonCommande.update({ where: { id: req.params.id }, data: req.body, include: { lines: true } });
  res.json(bc);
});

router.delete("/:id", async (req, res) => {
  await prisma.bonCommande.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
