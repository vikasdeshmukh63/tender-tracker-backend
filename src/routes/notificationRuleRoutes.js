import { Router } from "express";
import {
  listNotificationRules,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
} from "../controllers/notificationRuleController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authRequired, listNotificationRules);
router.post("/", authRequired, createNotificationRule);
router.put("/:id", authRequired, updateNotificationRule);
router.delete("/:id", authRequired, deleteNotificationRule);

export default router;

