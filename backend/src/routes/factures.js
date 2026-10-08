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
  const list = await prisma.facture.findMany({ include: { client: true, lines: true, payments: true }, orderBy: { date: "desc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const lines = body.lines || [];
  const tvaRate = body.tvaRate || 20;
  const count = await prisma.facture.count();
  const number = body.number || "FAC-" + new Date().getFullYear() + "-" + String(count + 1).padStart(5, "0");
  const totals = computeTotals(lines, tvaRate);
  const facture = await prisma.facture.create({
    data: {
      clientId: body.clientId,
      notes: body.notes,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: body.status || "ISSUED",
      number, tvaRate,
      totalHT: totals.totalHT,
      totalTTC: totals.totalTTC,
      lines: { create: lines.map(l => ({ description: l.description, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), total: Number(l.quantity) * Number(l.unitPrice) })) }
    },
    include: { lines: true, client: true }
  });
  res.status(201).json(facture);
});

router.delete("/:id", async (req, res) => {
  await prisma.facture.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
