import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const list = await prisma.expense.findMany({ orderBy: { date: "desc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const count = await prisma.expense.count();
  const number = body.number || "EXP-" + String(count + 1).padStart(5, "0");
  const e = await prisma.expense.create({
    data: {
      number,
      category: body.category,
      description: body.description,
      amount: Number(body.amount),
      method: body.method || "CASH",
      reference: body.reference,
      date: body.date ? new Date(body.date) : new Date()
    }
  });
  res.status(201).json(e);
});

router.delete("/:id", async (req, res) => {
  await prisma.expense.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
