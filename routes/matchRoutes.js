import express from "express";
import { matchController } from "../controllers/matchController.js";

const router = express.Router();

router.get("/matches", matchController.getMatches);

export default router;
