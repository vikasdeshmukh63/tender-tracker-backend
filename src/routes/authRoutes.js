import { Router } from "express";
import { signup, login, me, verifyOtp, resendOtp } from "../controllers/authController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", authRequired, me);

export default router;

