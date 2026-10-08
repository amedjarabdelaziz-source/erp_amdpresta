import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const list = await prisma.payment.findMany({ include: { facture: true, supplierInvoice: true }, orderBy: { date: "desc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const count = await prisma.payment.count();
  const number = body.number || "PAY-" + String(count + 1).padStart(5, "0");
  const payment = await prisma.payment.create({
    data: {
      number,
      amount: Number(body.amount),
      method: body.method || "BANK_TRANSFER",
      reference: body.reference,
      notes: body.notes,
      factureId: body.factureId || null,
      supplierInvoiceId: body.supplierInvoiceId || null
    }
  });

  if (payment.factureId) {
    const payments = await prisma.payment.findMany({ where: { factureId: payment.factureId } });
    const paid = payments.reduce((s, p) => s + p.amount, 0);
    const facture = await prisma.facture.findUnique({ where: { id: payment.factureId } });
    const status = paid >= facture.totalTTC ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "ISSUED";
    await prisma.facture.update({ where: { id: payment.factureId }, data: { paidAmount: paid, status } });
  }

  if (payment.supplierInvoiceId) {
    const payments = await prisma.payment.findMany({ where: { supplierInvoiceId: payment.supplierInvoiceId } });
    const paid = payments.reduce((s, p) => s + p.amount, 0);
    const inv = await prisma.supplierInvoice.findUnique({ where: { id: payment.supplierInvoiceId } });
    const status = paid >= inv.totalTTC ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "ISSUED";
    await prisma.supplierInvoice.update({ where: { id: payment.supplierInvoiceId }, data: { paidAmount: paid, status } });
  }

  res.status(201).json(payment);
});

router.delete("/:id", async (req, res) => {
  await prisma.payment.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
