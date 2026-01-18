import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { redisClient } from "../config/redisConfig.js";
import emailQueue from "../queue/emailQueue.js";

export const authService = {
    generateOTP: () => Math.floor(100000 + Math.random() * 900000).toString(),

    generateTokens: (userId, email) => {
        const accessToken = jwt.sign(
            { userId, email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" }
        );
        
        const refreshToken = jwt.sign(
            { userId, email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );
        
        return { accessToken, refreshToken };
    },

    register: async (email, name) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const user = new User({ email, name });
        await user.save();
        return user;
    },

    login: async (email) => {
        const otp = authService.generateOTP();
        const otpKey = `otp:${email}`;
        
        await redisClient.setex(otpKey, 300, otp); // 5 minutes expiry
        
        await emailQueue.add("sendMagicLink", {
            email,
            otp,
            type: "login"
        });
        
        return { message: "Magic link sent to your email" };
    },  

    verifyOTP: async (email, otp) => {
        const otpKey = `otp:${email}`;
        const storedOTP = await redisClient.get(otpKey);
        
        if (!storedOTP || storedOTP !== otp) {
            throw new Error("Invalid or expired OTP");
        }
        
        await redisClient.del(otpKey);
        
        let user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }
        
        user.isVerified = true;
        await user.save();
        
        const tokens = authService.generateTokens(user._id, user.email);
        return { user, tokens };
    }
};