import express from "express";
import { authController } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify", authController.verifyOTP);
router.post("/logout", authMiddleware, authController.logout);

export default router;