import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, requireRole } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const q = req.query.q;
  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] }
    : {};
  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sites: true, factures: true, devis: true } } }
  });
  res.json(clients);
});

router.get("/:id", async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id },
    include: {
      sites: true,
      devis: { take: 10, orderBy: { date: "desc" } },
      factures: { take: 10, orderBy: { date: "desc" } }
    }
  });
  if (!client) return res.status(404).json({ error: "Not found" });
  res.json(client);
});

router.post("/", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  const count = await prisma.client.count();
  const code = req.body.code || "CLI-" + String(count + 1).padStart(5, "0");
  const client = await prisma.client.create({ data: { ...req.body, code } });
  res.status(201).json(client);
});

router.put("/:id", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  const client = await prisma.client.update({ where: { id: req.params.id }, data: req.body });
  res.json(client);
});

router.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  await prisma.client.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
