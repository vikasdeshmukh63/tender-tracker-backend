import { Router } from "express";
import {
  listAuditLogs,
  createAuditLog,
} from "../controllers/auditLogController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authRequired, listAuditLogs);
router.post("/", authRequired, createAuditLog);

export default router;

