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
  const list = await prisma.devis.findMany({ include: { client: true, lines: true }, orderBy: { date: "desc" } });
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const devis = await prisma.devis.findUnique({ where: { id: req.params.id }, include: { client: true, lines: true, bcs: true } });
  if (!devis) return res.status(404).json({ error: "Not found" });
  res.json(devis);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const lines = body.lines || [];
  const tvaRate = body.tvaRate || 20;
  const count = await prisma.devis.count();
  const number = body.number || "DEV-" + new Date().getFullYear() + "-" + String(count + 1).padStart(5, "0");
  const totals = computeTotals(lines, tvaRate);
  const devis = await prisma.devis.create({
    data: {
      clientId: body.clientId,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      notes: body.notes,
      number, tvaRate,
      totalHT: totals.totalHT,
      totalTTC: totals.totalTTC,
      lines: { create: lines.map(l => ({ description: l.description, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), total: Number(l.quantity) * Number(l.unitPrice) })) }
    },
    include: { lines: true, client: true }
  });
  res.status(201).json(devis);
});

router.post("/:id/convert-to-bc", async (req, res) => {
  const devis = await prisma.devis.findUnique({ where: { id: req.params.id }, include: { lines: true } });
  if (!devis) return res.status(404).json({ error: "Not found" });
  const count = await prisma.bonCommande.count();
  const number = "BC-" + new Date().getFullYear() + "-" + String(count + 1).padStart(5, "0");
  const bc = await prisma.bonCommande.create({
    data: {
      number, clientId: devis.clientId, devisId: devis.id,
      tvaRate: devis.tvaRate, totalHT: devis.totalHT, totalTTC: devis.totalTTC,
      status: "DRAFT",
      lines: { create: devis.lines.map(l => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, total: l.total })) }
    },
    include: { lines: true }
  });
  res.status(201).json(bc);
});

router.delete("/:id", async (req, res) => {
  await prisma.devis.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
