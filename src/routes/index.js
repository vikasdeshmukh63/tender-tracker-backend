import { Router } from "express";
import authRoutes from "./authRoutes.js";
import tenderRoutes from "./tenderRoutes.js";
import taskRoutes from "./taskRoutes.js";
import auditLogRoutes from "./auditLogRoutes.js";
import attachmentRoutes from "./attachmentRoutes.js";
import taskCommentRoutes from "./taskCommentRoutes.js";
import notificationRuleRoutes from "./notificationRuleRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import userProfileRoutes from "./userProfileRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tenders", tenderRoutes);
router.use("/tasks", taskRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/attachments", attachmentRoutes);
router.use("/task-comments", taskCommentRoutes);
router.use("/notification-rules", notificationRuleRoutes);
router.use("/notifications", notificationRoutes);
router.use("/user-profiles", userProfileRoutes);

export default router;

