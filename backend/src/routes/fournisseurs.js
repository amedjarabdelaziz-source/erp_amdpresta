import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const list = await prisma.fournisseur.findMany({ orderBy: { name: "asc" } });
  res.json(list);
});

router.post("/", async (req, res) => {
  const count = await prisma.fournisseur.count();
  const code = req.body.code || "FOU-" + String(count + 1).padStart(5, "0");
  const f = await prisma.fournisseur.create({ data: { ...req.body, code } });
  res.status(201).json(f);
});

router.put("/:id", async (req, res) => {
  const f = await prisma.fournisseur.update({ where: { id: req.params.id }, data: req.body });
  res.json(f);
});

router.delete("/:id", async (req, res) => {
  await prisma.fournisseur.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
