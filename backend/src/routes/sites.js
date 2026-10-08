import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const clientId = req.query.clientId;
  const q = req.query.q;
  const where = { AND: [] };
  if (clientId) where.AND.push({ clientId });
  if (q) where.AND.push({ OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] });
  const sites = await prisma.site.findMany({ where, include: { client: true }, orderBy: { createdAt: "desc" } });
  res.json(sites);
});

router.post("/", async (req, res) => {
  const count = await prisma.site.count();
  const code = req.body.code || "SIT-" + String(count + 1).padStart(5, "0");
  const site = await prisma.site.create({ data: { ...req.body, code } });
  res.status(201).json(site);
});

router.put("/:id", async (req, res) => {
  const site = await prisma.site.update({ where: { id: req.params.id }, data: req.body });
  res.json(site);
});

router.delete("/:id", async (req, res) => {
  await prisma.site.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
