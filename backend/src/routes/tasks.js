import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const where = { AND: [] };
  if (req.query.assigneeId) where.AND.push({ assigneeId: req.query.assigneeId });
  if (req.query.status) where.AND.push({ status: req.query.status });
  if (req.query.siteId) where.AND.push({ siteId: req.query.siteId });
  const tasks = await prisma.task.findMany({
    where,
    include: { assignee: { select: { id: true, fullName: true } }, site: true, attachments: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const count = await prisma.task.count();
  const code = body.code || "TSK-" + String(count + 1).padStart(5, "0");
  const task = await prisma.task.create({
    data: {
      code,
      title: body.title,
      description: body.description,
      priority: body.priority || "MEDIUM",
      assigneeId: body.assigneeId || null,
      siteId: body.siteId || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null
    }
  });
  res.status(201).json(task);
});

router.put("/:id", async (req, res) => {
  const data = { ...req.body };
  if (data.status === "DONE") data.completedAt = new Date();
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  const task = await prisma.task.update({ where: { id: req.params.id }, data });
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
