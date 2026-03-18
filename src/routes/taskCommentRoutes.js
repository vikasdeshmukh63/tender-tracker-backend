import { Router } from "express";
import {
  listComments,
  createComment,
  deleteComment,
  upload,
} from "../controllers/taskCommentController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

// All authenticated users can read and post comments
router.get("/:taskId", authRequired, listComments);
router.post("/:taskId", authRequired, upload.single("file"), createComment);

// Only the comment author (or admin) can delete a comment
router.delete("/:taskId/comments/:commentId", authRequired, deleteComment);

export default router;
