import expressAsyncHandler from "express-async-handler";
import { successResponse, errorResponse } from "../utils/response.js";
import { matchService } from "../services/matchService.js";
import { authService } from "../services/authService.js";
import mongoose from "mongoose";

export const matchController = {
    getMatches: expressAsyncHandler(async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (page < 1 || limit < 1) {
                return errorResponse(res, 400, "Validation Error", "Page and limit must be positive numbers");
            }

            const result = await matchService.getMatchesService(req.user.userId, page, limit);
            return successResponse(res, "Matches retrieved successfully", result);
        } catch (err) {
            console.log(err);
            return errorResponse(res, 400, "Failed to get matches", err.message, err);
        }
    }),

    likeUserController: expressAsyncHandler(async (req, res) => {
        try{
            const { toUser } = req.body;
            const fromUser = req.user.userId;

            const makeMatch = await matchService.likeUserService(fromUser, toUser);
            if (makeMatch.hasMatched) return successResponse(res, "User Found a Match", { matchStatus: makeMatch.hasMatched });
            else return successResponse(res, 'Like Created', { matchStatus: makeMatch.hasMatched });
        }
        catch(err){
            console.log(err);
            return errorResponse(res, 400, "Failed to create Like", err.message, err);
        }
    }),

    passUserController: expressAsyncHandler(async (req, res) => {
        try{
            const { toUser } = req.body;
            const fromUser = req.user.userId;

            const createPass = await matchService.passUserService(fromUser, toUser);
            if (createPass) return successResponse(res, '', '', 204);
            else throw new Error("Something went wrong");
        }
        catch(err){
            console.log(err);
            return errorResponse(res, 400, "Failed to create Pass", err.message, err);
        }
    }),

    getAlredyMatchedUsersController: expressAsyncHandler(async(req, res) => {
        try {
            const userId = req.user.userId;
            const matchedUsers = await matchService.getAlreadyMatchedUsersService(userId);

            for (var i of matchedUsers) {
                console.log(i.users)
            }
            if (matchedUsers.length >= 1){
                const getUserDetails = await Promise.all(
                    matchedUsers.map(user => authService.findUserById(user.users[0].toString() === userId ? user.users[1] : user.users[0]))
                );

                return successResponse(res, "Found Matches", getUserDetails);
            }
            else throw new Error("No Matches Found");
        } 
        catch (err) {
            console.log(err);
            return errorResponse(res, 400, "Failed to Get Matched Users", err.message, err);
        }
    })
};
