import { Router } from "express";
import { searchProfiles } from "../controllers/userProfileController.js";

const router = Router();

// Public endpoint: used on the login screen to prefill details by email.
router.get("/", searchProfiles);

export default router;

