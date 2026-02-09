import express from "express";
import { userController } from "../controllers/userControllers.js";
import { imageUploadMiddleware } from "../middlewares/imageUpload.js";

const router = express.Router();

router.post("/set-user-preference", imageUploadMiddleware, userController.setUserPreferencesController);
router.patch("/update-profile", imageUploadMiddleware, userController.updateProfile);
router.get("/get-user-details", userController.getUserById);
router.get("/image/:userId/:index", userController.getUserImageByIdController);

export default router;