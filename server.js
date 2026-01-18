import express from "express";
import { reqLogger } from "./middlewares/logger.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

// Initialize expresss app
const app = express();

// Add utils and routes
app.use(reqLogger);

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