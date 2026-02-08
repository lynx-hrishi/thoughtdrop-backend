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
            const isUser = await authService.findUserByEmail(email);

            if (!isUser) {
                const user = await authService.register(email);
                // return successResponse(res, "User registered and logged in", { user });
            }
            const result = await authService.login(email);
            return successResponse(res, result.message, result.otp);
        } catch (error) {
            return errorResponse(res, 400, "Login Failed", error.message);
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
                secure: process.env.NODE_ENV === "production"
            });
            
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            });
            
            successResponse(res, "Login successful", {
                user: { id: user._id, email: user.email, name: user.name, isProfileSet: user.isProfileSet }
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