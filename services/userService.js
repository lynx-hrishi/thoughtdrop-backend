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
    },

    updateProfileService: async (userId, body, files) => {
        const { gender, profession, interests, partnerGender, partnerPreference, ageFrom, ageEnd } = body;
        
        const updateData = {};
        if (gender) updateData.gender = gender.toUpperCase();
        if (profession) updateData.profession = profession;
        if (interests) updateData.interests = interests;
        
        if (files?.profileImage?.[0]) {
            const compressedProfileImage = await compressImage(files.profileImage[0]);
            updateData.profileImage = compressedProfileImage;
            console.log('Profile image compressed, size:', compressedProfileImage.length, 'isBuffer:', Buffer.isBuffer(compressedProfileImage));
        }
        
        if (files?.postImages) {
            const compressedPostImages = await compressImages(files.postImages);
            await User.findByIdAndUpdate(
                userId,
                { $push: { postImages: { $each: compressedPostImages } } }
            );
            console.log('Post images compressed and appended, count:', compressedPostImages.length);
        }
        
        console.log('Update data keys:', Object.keys(updateData));
        console.log('UserId:', userId);
        
        if (Object.keys(updateData).length > 0) {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            );
            
            console.log('Update result:', updatedUser ? 'Success' : 'Failed');
            
            // Verify the save
            const verifyUser = await User.findById(userId).select('postImages profileImage');
            console.log('Verification - Has profileImage:', !!verifyUser?.profileImage);
            console.log('Verification - postImages count:', verifyUser?.postImages?.length || 0);
            
            if (!updatedUser) throw new Error("Failed to update user profile");
        }
        
        const prefUpdateData = {};
        if (partnerGender) prefUpdateData.partnerGender = partnerGender.toUpperCase();
        if (partnerPreference) prefUpdateData.partnerPreference = partnerPreference;
        if (ageFrom) prefUpdateData.ageFrom = ageFrom;
        if (ageEnd) prefUpdateData.ageEnd = ageEnd;
        
        let updatedPreference = null;
        if (Object.keys(prefUpdateData).length > 0) {
            updatedPreference = await UserPreferenceModel.findOneAndUpdate(
                { userId },
                prefUpdateData,
                { new: true }
            ).lean();
        }
        
        const finalUser = await User.findById(userId).select("-profileImage -postImages -__v -createdAt -updatedAt").lean();
        
        return { user: finalUser, preference: updatedPreference };
    },

    deletePostImageService: async (userId, index) => {
        const user = await User.findById(userId).select("postImages");
        if (!user) throw new Error("User not found");
        
        if (user.postImages.length <= 1) {
            throw new Error("Cannot delete the last post image. At least one post image is required");
        }
        
        const imageIndex = parseInt(index);
        if (imageIndex < 0 || imageIndex >= user.postImages.length) {
            throw new Error("Invalid image index");
        }
        
        await User.findByIdAndUpdate(
            userId,
            { $unset: { [`postImages.${imageIndex}`]: 1 } }
        );
        
        await User.findByIdAndUpdate(
            userId,
            { $pull: { postImages: null } }
        );
        
        return { message: "Post image deleted successfully" };
    }
}

export {
    userService
};