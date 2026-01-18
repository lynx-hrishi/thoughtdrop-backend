import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { reqLogger } from "./middlewares/logger.js";
import authRoutes from "./routes/authRoutes.js";
import "./queue/emailWorker.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(reqLogger);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/thoughtdrop")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);

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