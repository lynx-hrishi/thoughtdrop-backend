import mongoose from "mongoose";
import { zodiacConstants, genderConstants } from "../constants/allConstants.js";

const userPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    partnerPreference: {
        type: String,
        enum: [
            genderConstants.Male,
            genderConstants.Female
        ],
        required: true
    },
    ageFrom: {
        type: Number
    },
    ageEnd: {
        type: Number
    },
    
});

export default mongoose.model("UserPreference", userPreferenceSchema);