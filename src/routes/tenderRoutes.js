import { Router } from "express";
import {
  listTenders,
  getTender,
  createTender,
  updateTender,
  deleteTender,
} from "../controllers/tenderController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authRequired, listTenders);
router.get("/:id", authRequired, getTender);
router.post("/", authRequired, createTender);
router.put("/:id", authRequired, updateTender);
router.delete("/:id", authRequired, deleteTender);

export default router;

