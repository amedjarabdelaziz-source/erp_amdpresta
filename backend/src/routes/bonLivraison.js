import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const list = await prisma.bonLivraison.findMany({ include: { bc: { include: { client: true } }, lines: true }, orderBy: { date: "desc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const lines = body.lines || [];
  const count = await prisma.bonLivraison.count();
  const number = body.number || "BL-" + new Date().getFullYear() + "-" + String(count + 1).padStart(5, "0");
  const bl = await prisma.bonLivraison.create({
    data: {
      number,
      bcId: body.bcId || null,
      deliveredBy: body.deliveredBy,
      receivedBy: body.receivedBy,
      notes: body.notes,
      lines: { create: lines.map(l => ({ description: l.description, quantity: Number(l.quantity), unit: l.unit || "U" })) }
    },
    include: { lines: true, bc: true }
  });
  res.status(201).json(bl);
});

router.delete("/:id", async (req, res) => {
  await prisma.bonLivraison.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
