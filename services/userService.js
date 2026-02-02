import User from "../models/User.js";
import UserPreferenceModel from "../models/UserPreferenceModel.js";
import { startTransaction, commitTransaction, abortTransaction } from "../config/handleDbTransactions.js";
import { getZodiacSign } from "./zodiacService.js";
import { authService } from "./authService.js";

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

            const updateData = {
                name, gender: gender.toUpperCase(), dateOfBirth: dob, zodiacSign, profession, interests, isProfileSet: true,
                profileImage: files.profileImage[0].buffer
            };
            
            if (files.postImages) {
                updateData.postImages = files.postImages.map(file => file.buffer);
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
    }
}

export {
    userService
};