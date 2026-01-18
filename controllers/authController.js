import asyncHandler from "express-async-handler";
import { authService } from "../services/authService.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const authController = {
    register: asyncHandler(async (req, res) => {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return errorResponse(res, 400, "Validation Error", "Email and name are required");
        }
        
        try {
            const user = await authService.register(email, name);
            successResponse(res, "User registered successfully", null, 201);
        } catch (error) {
            errorResponse(res, 400, "Registration Failed", error.message);
        }
    }),

    login: asyncHandler(async (req, res) => {
        const { email } = req.body;
        
        if (!email) {
            return errorResponse(res, 400, "Validation Error", "Email is required");
        }
        
        try {
            const result = await authService.login(email);
            successResponse(res, result.message, result.otp);
        } catch (error) {
            errorResponse(res, 400, "Login Failed", error.message);
        }
    }),

    verifyOTP: asyncHandler(async (req, res) => {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return errorResponse(res, 400, "Validation Error", "Email and OTP are required");
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
            
            successResponse(res, "Login successful", {
                user: { id: user._id, email: user.email, name: user.name }
            });
        } catch (error) {
            errorResponse(res, 400, "Verification Failed", error.message);
        }
    }),

    logout: asyncHandler(async (req, res) => {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        successResponse(res, "Logged out successfully");
    })
};