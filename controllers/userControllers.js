import expressAsyncHandler from "express-async-handler";
import { successResponse, errorResponse } from "../utils/response.js";
import { userService } from "../services/userService.js";
import { authService } from "../services/authService.js";

const userController = {
    setUserPreferencesController: expressAsyncHandler(async (req, res) => {
        try {
            const userPref = await userService.setUserPreferencesService(req.user.userId, req.body, req.files);
            return successResponse(res, "User Preference set successfully", userPref, 201);
        } 
        catch (err) {
            console.log(err);
            return errorResponse(res, 400, "Operation Failed", err.message, err);
        }
    }),

    getUserById: expressAsyncHandler(async(req, res) => {
        try {
            const user = await authService.findUserById(req.user.userId);
            // console.log(user)
            if (!user) throw new Error("User not found");
            return successResponse(res, "User found", user);
        } 
        catch (err) {
            console.log(err);
            return errorResponse(res, 400, "Failed to load User Info", err.message, err);
        }
    }),

    getUserByEmail: expressAsyncHandler(async(req, res) => {
        try {
            const user = await authService.findUserByEmail(req.user.email);
            if (!user) throw new Error("User not found");
            return successResponse(res, "User found", user);
        } 
        catch (err) {
            console.log(err);
            return errorResponse(res, 400, "Failed to load User Info", err.message, err);
        }
    }),

    getUserImageByIdController: expressAsyncHandler(async (req, res) => {
        try{
            const imageData = await userService.getUserImageByIdService(req.params.userId, req.params.index);
            
            if (!imageData) {
                return errorResponse(res, 404, "Image not found", "No image found for the specified user");
            }
            
            // Convert MongoDB Binary to Buffer
            const imageBuffer = Buffer.from(imageData.buffer || imageData);
            
            res.set('Content-Type', 'image/jpeg');
            res.end(imageBuffer);
        }
        catch(err){
            console.log(err);
            return errorResponse(res, 400, "Failed to load User Image", err.message, err);
        }
    })
}

export {
    userController
};