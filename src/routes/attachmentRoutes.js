import { Router } from "express";
import {
  listAttachments,
  uploadAttachment,
  deleteAttachment,
  upload,
} from "../controllers/attachmentController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:tenderId", authRequired, listAttachments);
router.post("/:tenderId", authRequired, upload.single("file"), uploadAttachment);
router.delete("/file/:id", authRequired, deleteAttachment);

export default router;

