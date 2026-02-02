import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { redisClient } from "../config/redisConfig.js";
import emailQueue from "../queue/emailQueue.js";

export const authService = {
    generateOTP: () => Math.floor(100000 + Math.random() * 900000),

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

    register: async (email, name="Unknown") => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const user = new User({ email, name });
        await user.save();
        return user;
    },

    login: async (email) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found. Please register first.");
        }

        const otp = authService.generateOTP();
        const otpKey = `otp:${email}`;
        
        await redisClient.setex(otpKey, 300, Number(otp)); // 5 minutes expiry
        
        await emailQueue.add("sendOTP", {
            email,
            otp,
            type: "login"
        });
        
        return { message: "OTP sent to your email", otp };
    },  

    verifyOTP: async (email, otp) => {
        const otpKey = `otp:${email}`;
        const storedOTP = await redisClient.get(otpKey);
        
        if (!storedOTP || Number(storedOTP) !== otp) {
            throw new Error("Invalid or expired OTP");
        }
        
        await redisClient.del(otpKey);
        
        let user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }
        
        if (user.verificationExpiresAt) {
            await User.findByIdAndUpdate(user._id, { $unset: { verificationExpiresAt: "" } });
        }

        user.isVerified = true;
        await user.save();
        
        const tokens = authService.generateTokens(user._id, user.email);
        return { user, tokens };
    },

    findUserByEmail: async (email) => await User.findOne({ email }),

    findUserById: async (id) => await User.findById(id),
};