import User from "../models/User.js";
import UserPreferenceModel from "../models/UserPreferenceModel.js";
import { calculateAge } from "./calculateAge.js";
import { authService } from "./authService.js";
import Like from "../models/Like.js";
import Match from "../models/Match.js";
import mongoose from "mongoose";
import Pass from "../models/Pass.js";

export const matchService = {
    getMatchesService: async (userId, page = 1, limit = 10) => {
        const userPreference = await UserPreferenceModel.findOne({ userId }).lean();
        if (!userPreference) throw new Error("User preferences not set");

        const currentUser = await User.findById(userId).select("gender dateOfBirth").lean();
        if (!currentUser) throw new Error("User not found");

        const currentUserAge = calculateAge(currentUser.dateOfBirth);
        const skip = (page - 1) * limit;

        const interactedUserIds = await Like.distinct("toUser", {
            fromUser: userId
        });

        const passedUserIds = await Pass.distinct("toUser", {
            fromUser: userId
        });

        const matchedUserIds = await Match.distinct("users", {
            users: userId
        });

        const excludedUserIds = [
            ...interactedUserIds,
            ...passedUserIds,
            ...matchedUserIds,
            userId
        ];

        // Build match query based on user preferences
        const matchQuery = {
            _id: { $nin: excludedUserIds },
            isVerified: true,
            isProfileSet: true,
            gender: userPreference.partnerGender
        };

        // Get all potential matches to filter by age
        const potentialMatches = await User.find(matchQuery)
            .select("-profileImage -postImages -__v -verificationExpiresAt -isVerified -createdAt -updatedAt")
            .limit(10)
            .lean();

        // Filter by age range
        const filteredMatches = potentialMatches.filter(user => {
            const userAge = calculateAge(user.dateOfBirth);
            return userAge >= userPreference.ageFrom && userAge <= userPreference.ageEnd;
        });

        // Apply pagination
        const paginatedMatches = filteredMatches.slice(skip, skip + limit);

        // Add age and image URLs to each match
        const matchesWithDetails = await Promise.all(
            paginatedMatches.map(user => authService.findUserById(user._id))
        );

        return {
            matches: matchesWithDetails,
            pagination: {
                currentPage: page,
                totalMatches: filteredMatches.length,
                totalPages: Math.ceil(filteredMatches.length / limit),
                hasNextPage: skip + limit < filteredMatches.length,
                hasPrevPage: page > 1
            }
        };
    },

    likeUserService: async (fromUser, toUser) => {
        const createLike = await Like.create({
            fromUser: new mongoose.Types.ObjectId(fromUser),
            toUser: new mongoose.Types.ObjectId(toUser)
        });

        const checkIfMutual = await Like.findOne({ 
            fromUser: new mongoose.Types.ObjectId(toUser), 
            toUser: new mongoose.Types.ObjectId(fromUser) 
        });
        console.log({checkIfMutual})

        if (checkIfMutual){
            const users  = [fromUser, toUser].sort();

            try{
                const createMatch = await Match.create({ users });
                console.log({createMatch})
                return { hasMatched: true };
            }
            catch(err) {
                if (err.code !== 11000) throw err;
                else throw new Error("Duplication Error");
            }
        }
        return { hasMatched: false };
    },

    passUserService: async(fromUser, toUser) => {
        const createPass = await Pass.create({
            fromUser,
            toUser
        });

        return true;
    },

    getAlreadyMatchedUsersService: async (userId) => {
        const getAllMatches = await Match.find({ users: userId });
        return getAllMatches;
    }
};
