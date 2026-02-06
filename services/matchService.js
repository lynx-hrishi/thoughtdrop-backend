import User from "../models/User.js";
import UserPreferenceModel from "../models/UserPreferenceModel.js";
import { calculateAge } from "./calculateAge.js";
import { authService } from "./authService.js";

export const matchService = {
    getMatchesService: async (userId, page = 1, limit = 10) => {
        const userPreference = await UserPreferenceModel.findOne({ userId }).lean();
        if (!userPreference) throw new Error("User preferences not set");

        const currentUser = await User.findById(userId).select("gender dateOfBirth").lean();
        if (!currentUser) throw new Error("User not found");

        const currentUserAge = calculateAge(currentUser.dateOfBirth);
        const skip = (page - 1) * limit;

        // Build match query based on user preferences
        const matchQuery = {
            _id: { $ne: userId },
            isVerified: true,
            isProfileSet: true,
            gender: userPreference.partnerGender
        };

        // Get all potential matches to filter by age
        const potentialMatches = await User.find(matchQuery)
            .select("-profileImage -postImages -__v -verificationExpiresAt -isVerified -createdAt -updatedAt")
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
    }
};
