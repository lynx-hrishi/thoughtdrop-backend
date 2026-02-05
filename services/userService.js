import User from "../models/User.js";
import UserPreferenceModel from "../models/UserPreferenceModel.js";
import { startTransaction, commitTransaction, abortTransaction } from "../config/handleDbTransactions.js";
import { getZodiacSign } from "./zodiacService.js";
import { authService } from "./authService.js";
import { compressImage, compressImages } from "../utils/imageUtils.js";
import mongoose from "mongoose";

const userService = { 
    setUserPreferencesService: async (user_id, body, files) => {
        const { 
            name, gender, dob, profession, interests, partnerGender,
            partnerPreference, ageFrom, ageEnd
        } = body;

        if (!name || !gender || !dob || !profession || !interests || !partnerGender || !partnerPreference || !ageFrom || !ageEnd) throw new Error("Fields cannot be empty");
        if (!files?.profileImage?.[0]) throw new Error("Profile image is required");

        const session = await startTransaction();
        const userPrefNotSetErrorMsg = "Failed to set user preferences";
        const zodiacSign = getZodiacSign(dob);

        try{
            const user = await authService.findUserById(user_id);
            if (user.isProfileSet) throw new Error("Profile is already set. Please Update the Profile");

            // Compress profile image
            const compressedProfileImage = await compressImage(files.profileImage[0]);

            const updateData = {
                name, gender: gender.toUpperCase(), dateOfBirth: dob, zodiacSign, profession, interests, isProfileSet: true,
                profileImage: compressedProfileImage
            };
            
            // Compress post images if they exist
            if (files.postImages) {
                updateData.postImages = await compressImages(files.postImages);
            }
             
            const saveUser = await User.findByIdAndUpdate(user_id, updateData, { new: true }).select("-profileImage -postImages -__v -createdAt -updatedAt").lean();
            
            if(!saveUser) {
                // await abortTransaction(session);
                throw new Error(userPrefNotSetErrorMsg);
            }
            const saveUserPreference = await UserPreferenceModel.create({
                userId: saveUser._id, partnerGender: partnerGender.toUpperCase(), partnerPreference, ageFrom, ageEnd
            });
            
            if(!saveUserPreference) {
                // await abortTransaction(session);
                throw new Error(userPrefNotSetErrorMsg);
            }
            await commitTransaction(session);
            return {saveUserPreference, saveUser};
        }
        catch(err){
            await abortTransaction(session);
            throw err;
        }
    },

    getUserImageByIdService: async (id, index) => {
        let result;
        
        if (Number.isNaN(Number(index))) {
            result = await User.findById(id).select("profileImage").lean();
            return result?.profileImage;
        } else {
            result = await User.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $project: {
                        postImage: { $arrayElemAt: ['$postImages', Number(index)] }
                    }
                }
            ]);
            return result[0]?.postImage;
        }
    }
}

export {
    userService
};