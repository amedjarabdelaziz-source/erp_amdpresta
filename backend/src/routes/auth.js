import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { comparePassword, signToken, hashPassword, authMiddleware } from "../lib/auth.js";

const router = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(4) });

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid payload" });
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.fullName });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, avatar: user.avatar } });
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, fullName: true, role: true, phone: true, avatar: true }
  });
  res.json(user);
});

router.post("/change-password", authMiddleware, async (req, res) => {
  const { current, next } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await comparePassword(current, user.password))) return res.status(400).json({ error: "Wrong password" });
  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(next) } });
  res.json({ ok: true });
});

export default router;
