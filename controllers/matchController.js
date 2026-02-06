import expressAsyncHandler from "express-async-handler";
import { successResponse, errorResponse } from "../utils/response.js";
import { matchService } from "../services/matchService.js";

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
    })
};
