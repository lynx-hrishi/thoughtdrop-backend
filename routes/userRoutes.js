import express from "express";
import { userController } from "../controllers/userControllers.js";
import { imageUploadMiddleware } from "../middlewares/imageUpload.js";

const router = express.Router();

router.post("/set-user-preference", imageUploadMiddleware, userController.setUserPreferencesController);
router.get("/get-user-details", userController.getUserById);

export default router;