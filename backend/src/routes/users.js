import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, requireRole, hashPassword } from "../lib/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true, phone: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(users);
});

router.post("/", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  const body = req.body;
  const user = await prisma.user.create({
    data: {
      email: body.email,
      fullName: body.fullName,
      password: await hashPassword(body.password || "changeme123"),
      role: body.role || "TECHNICIAN",
      phone: body.phone
    },
    select: { id: true, email: true, fullName: true, role: true, active: true }
  });
  res.status(201).json(user);
});

router.put("/:id", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  const body = req.body;
  const data = {
    email: body.email,
    fullName: body.fullName,
    role: body.role,
    phone: body.phone,
    active: body.active
  };
  if (body.password) data.password = await hashPassword(body.password);
  const user = await prisma.user.update({
    where: { id: req.params.id }, data,
    select: { id: true, email: true, fullName: true, role: true, active: true }
  });
  res.json(user);
});

router.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
