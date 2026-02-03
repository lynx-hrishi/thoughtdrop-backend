import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { redisClient } from "../config/redisConfig.js";
import emailQueue from "../queue/emailQueue.js";
import { calculateAge } from "./calculateAge.js";
import mongoose from "mongoose";

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

        const user = new User({ email, name, verificationExpiresAt: new Date(Date.now() + 5 * 60 * 1000) });
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
        
        await redisClient.del(otpKey);
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
        
        const updatedUser = await User.updateOne({ email }, {
            $set: { isVerified: true },
            $unset: { verificationExpiresAt: "" }
        })
        console.log({updatedUser})
        
        const tokens = authService.generateTokens(user._id, user.email);
        return { user, tokens };
    },

    findUserByEmail: async (email) => {
        const user = await User.findOne({ email });
        // if (user.dateOfBirth) user.age = calculateAge(user?.dateOfBirth);
        return user;
    },

    findUserById: async (id) => {
        // const userDoc = await User.findById(id).select("-profileImage -postImages -__v -createdAt -updatedAt");
        const userDoc = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) },    
            },
            {
                $project: {
                    _id: 1,
                    email: 1,
                    name: 1,
                    gender: 1,
                    dateOfBirth: 1,
                    zodiacSign: 1,
                    profession: 1,
                    interest: 1,
                    postImagesCount: { $size: "$postImages" }
                }
            }
        ]);

        const user = userDoc[0];
        if (user.dateOfBirth) user.age = calculateAge(user.dateOfBirth);
        if (user.postImagesCount >= 1) {
            const url = [];
            for (let i=0; i<= (user.postImagesCount - 1); i++) {
                url.push(`${process.env.BACKEND_URL}/api/user/image/${user._id}/${i}`)
            }
            user.postImageUrl = url;
            user.profileImageUrl = `${process.env.BACKEND_URL}/api/user/image/${user._id}/banner`;
        }
        return user;
    },
};