import { Router } from "express";
import {
  listNotifications,
  createNotification,
  updateNotification,
  markAllRead,
} from "../controllers/notificationController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authRequired, listNotifications);
router.post("/", authRequired, createNotification);
router.put("/mark-all-read", authRequired, markAllRead);
router.put("/:id", authRequired, updateNotification);

export default router;
