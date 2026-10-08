import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, unique);
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 15 * 1024 * 1024 } });
router.use(authMiddleware);

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const attachment = await prisma.attachment.create({
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: "/uploads/" + req.file.filename,
      taskId: req.body.taskId || null,
      interventionId: req.body.interventionId || null
    }
  });
  res.status(201).json(attachment);
});

router.delete("/:id", async (req, res) => {
  const att = await prisma.attachment.findUnique({ where: { id: req.params.id } });
  if (att) {
    const filepath = path.join(uploadDir, att.filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    await prisma.attachment.delete({ where: { id: req.params.id } });
  }
  res.json({ ok: true });
});

export default router;
