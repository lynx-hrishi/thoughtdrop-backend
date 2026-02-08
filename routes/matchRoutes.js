import express from "express";
import { matchController } from "../controllers/matchController.js";

const router = express.Router();

router.get("/matches", matchController.getMatches);
router.post("/like-user", matchController.likeUserController);
router.post("/pass-user", matchController.passUserController);
router.get("/get-matched-users", matchController.getAlredyMatchedUsersController);

export default router;
