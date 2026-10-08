import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const where = { AND: [] };
  if (req.query.technicianId) where.AND.push({ technicianId: req.query.technicianId });
  if (req.query.siteId) where.AND.push({ siteId: req.query.siteId });
  if (req.query.status) where.AND.push({ status: req.query.status });
  const list = await prisma.intervention.findMany({
    where,
    include: { site: { include: { client: true } }, technician: { select: { id: true, fullName: true } }, photos: true },
    orderBy: { scheduledAt: "desc" }
  });
  res.json(list);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const count = await prisma.intervention.count();
  const code = body.code || "INT-" + String(count + 1).padStart(5, "0");
  const intervention = await prisma.intervention.create({
    data: {
      code,
      title: body.title,
      description: body.description,
      siteId: body.siteId,
      technicianId: body.technicianId || null,
      scheduledAt: new Date(body.scheduledAt),
      status: body.status || "PLANNED"
    }
  });
  res.status(201).json(intervention);
});

router.put("/:id", async (req, res) => {
  const data = { ...req.body };
  if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);
  const intervention = await prisma.intervention.update({ where: { id: req.params.id }, data });
  res.json(intervention);
});

router.delete("/:id", async (req, res) => {
  await prisma.intervention.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
