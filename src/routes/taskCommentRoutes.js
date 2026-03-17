import { Router } from "express";
import {
  listComments,
  createComment,
} from "../controllers/taskCommentController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:taskId", authRequired, listComments);
router.post("/:taskId", authRequired, createComment);

export default router;

