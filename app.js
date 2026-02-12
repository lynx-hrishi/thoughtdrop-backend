import { server } from "./serverFile.js";
import dotenv from 'dotenv';
import express from "express";

dotenv.config({ quiet: true });

const PORT = process.env.PORT;

server.listen(PORT, (req, res) => {
    console.log(`Server running on http://localhost:${PORT}`);
});