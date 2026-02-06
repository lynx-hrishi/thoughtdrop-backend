import express from "express";
import cookieParser from "cookie-parser";
import { reqLogger } from "./middlewares/logger.js";
import authRoutes from "./routes/authRoutes.js";
import "./queue/emailWorker.js";
import dotenv from "dotenv";
import { connectToDb } from "./config/dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import { authMiddleware } from "./middlewares/auth.js";

dotenv.config({ quiet: true });

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(reqLogger);

await connectToDb();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/match", authMiddleware, matchRoutes);

// Static routes for health checkups
app.get("/", (req, res) => {
    return res.json({ message: "ThoughtDrop Backend is up and running!!" });
});

app.get("/api/health", (req, res) => {
    return res.json({ message: "API is healthly" });
});

const PORT = process.env.PORT;

app.listen(PORT, (req, res) => {
    console.log(`Server running on http://localhost:${PORT}`);
});