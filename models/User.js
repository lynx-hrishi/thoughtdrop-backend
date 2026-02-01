import mongoose from "mongoose";
import { genderConstants, zodiacConstants } from "../constants/allConstants.js";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    name: {
        type: String
    },
    gender: {
        type: String,
        enum: [
            genderConstants.Male, 
            genderConstants.Female
        ]
    },
    age: {
        type: Number
    },
    zodiacSign: {
        type: String,
        enum: [
            zodiacConstants.Aries, 
            zodiacConstants.Taurus, 
            zodiacConstants.Gemini, 
            zodiacConstants.Cancer, 
            zodiacConstants.Leo, 
            zodiacConstants.Virgo, 
            zodiacConstants.Libra, 
            zodiacConstants.Scorpio, 
            zodiacConstants.Sagittarius, 
            zodiacConstants.Capricorn, 
            zodiacConstants.Aquarius, 
            zodiacConstants.Pisces
        ]
    },
    profession: {
        type: String,
    },
    interests: {
        type: [String],
    },
    profileImage: {
        type: Buffer
    },
    postImages: {
        type: [Buffer]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationExpiresAt: {
        type: Date,
        index: { expires: 0 },
        default:  new Date(Date.now() + 5 * 60 * 1000)
    }
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);