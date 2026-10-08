import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const list = await prisma.travaux.findMany({ include: { tasks: true }, orderBy: { createdAt: "desc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const count = await prisma.travaux.count();
  const code = req.body.code || "TRV-" + String(count + 1).padStart(5, "0");
  const data = { ...req.body, code };
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);
  if (data.budget) data.budget = Number(data.budget);
  const t = await prisma.travaux.create({ data });
  res.status(201).json(t);
});

router.put("/:id", async (req, res) => {
  const t = await prisma.travaux.update({ where: { id: req.params.id }, data: req.body });
  res.json(t);
});

router.delete("/:id", async (req, res) => {
  await prisma.travaux.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
