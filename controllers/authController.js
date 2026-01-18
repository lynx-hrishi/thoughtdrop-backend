import asyncHandler from "express-async-handler";
import { authService } from "../services/authService.js";

export const authController = {
    register: asyncHandler(async (req, res) => {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({ message: "Email and name are required" });
        }
        
        try {
            const user = await authService.register(email, name);
            res.status(201).json({ 
                message: "User registered successfully",
                user: { id: user._id, email: user.email, name: user.name }
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),

    login: asyncHandler(async (req, res) => {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        try {
            const result = await authService.login(email);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),

    verifyOTP: asyncHandler(async (req, res) => {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        
        try {
            const { user, tokens } = await authService.verifyOTP(email, otp);
            
            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60 * 1000
            });
            
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            res.json({
                message: "Login successful",
                user: { id: user._id, email: user.email, name: user.name }
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),

    logout: asyncHandler(async (req, res) => {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    })
};