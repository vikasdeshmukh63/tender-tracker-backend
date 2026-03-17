import { Router } from "express";
import { searchProfiles } from "../controllers/userProfileController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

// Kept simple: allow profile lookup by email; you can open this if needed.
router.get("/", authRequired, searchProfiles);

export default router;

