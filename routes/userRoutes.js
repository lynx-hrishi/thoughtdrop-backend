import express from "express";
import { userController } from "../controllers/userControllers.js";

const router = express.Router();

router.post("/set-user-preference", userController.setUserPreferencesController);
router.get("/get-user-details", userController.getUserById);

export default router;