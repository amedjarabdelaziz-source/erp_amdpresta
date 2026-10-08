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
  const list = await prisma.purchaseOrder.findMany({ include: { fournisseur: true, lines: true }, orderBy: { date: "desc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const lines = body.lines || [];
  const tvaRate = body.tvaRate || 20;
  const count = await prisma.purchaseOrder.count();
  const number = body.number || "PO-" + new Date().getFullYear() + "-" + String(count + 1).padStart(5, "0");
  const totals = computeTotals(lines, tvaRate);
  const po = await prisma.purchaseOrder.create({
    data: {
      fournisseurId: body.fournisseurId,
      notes: body.notes,
      number, tvaRate,
      totalHT: totals.totalHT,
      totalTTC: totals.totalTTC,
      lines: { create: lines.map(l => ({ description: l.description, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), total: Number(l.quantity) * Number(l.unitPrice) })) }
    },
    include: { lines: true, fournisseur: true }
  });
  res.status(201).json(po);
});

router.delete("/:id", async (req, res) => {
  await prisma.purchaseOrder.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
