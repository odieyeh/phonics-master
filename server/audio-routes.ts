import { Router, Request, Response } from "express";
import multer from "multer";
import { uploadAudio } from "./audio-service";

const router = Router();

// Use memory storage so we can pipe directly to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/m4a", "audio/mp4"];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

/**
 * POST /api/audio/upload
 * Accepts multipart/form-data with a single "file" field.
 * Returns { url, key } of the uploaded audio.
 */
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No audio file provided" });
        return;
      }

      const type = (req.body?.type as "word" | "sentence") || "word";
      const result = await uploadAudio(req.file.buffer, req.file.originalname, type);

      res.json({ url: result.url, key: result.key });
    } catch (err) {
      console.error("[AudioUpload] Error:", err);
      res.status(500).json({ error: "Failed to upload audio" });
    }
  }
);

export default router;
