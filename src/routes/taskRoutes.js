import { Router } from "express";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authRequired, listTasks);
router.post("/", authRequired, createTask);
router.put("/:id", authRequired, updateTask);
router.delete("/:id", authRequired, deleteTask);

export default router;

