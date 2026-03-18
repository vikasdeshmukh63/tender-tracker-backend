import { Router } from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { getPresignedUrl } from "../services/fileService.js";

const router = Router();

/**
 * GET /api/files/presigned?object=<minio-object-name>
 *
 * Returns a time-limited presigned URL so the client can download
 * a file directly from MinIO without the bucket needing public read access.
 *
 * The URL expires after 1 hour (3600 s).
 */
router.get("/presigned", authRequired, async (req, res, next) => {
  try {
    const { object } = req.query;
    if (!object) {
      return res.status(400).json({ message: "Query param 'object' is required" });
    }
    const url = await getPresignedUrl(decodeURIComponent(object));
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

export default router;
