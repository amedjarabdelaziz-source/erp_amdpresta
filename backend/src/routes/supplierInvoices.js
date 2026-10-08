import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const list = await prisma.supplierInvoice.findMany({ include: { fournisseur: true, payments: true }, orderBy: { date: "desc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const tvaRate = body.tvaRate || 20;
  const totalHT = Number(body.totalHT) || 0;
  const count = await prisma.supplierInvoice.count();
  const number = body.number || "SF-" + new Date().getFullYear() + "-" + String(count + 1).padStart(5, "0");
  const inv = await prisma.supplierInvoice.create({
    data: {
      fournisseurId: body.fournisseurId,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: body.status || "ISSUED",
      number, tvaRate, totalHT,
      totalTTC: totalHT * (1 + tvaRate / 100)
    }
  });
  res.status(201).json(inv);
});

router.delete("/:id", async (req, res) => {
  await prisma.supplierInvoice.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
