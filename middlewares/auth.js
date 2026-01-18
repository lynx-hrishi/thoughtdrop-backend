import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const authMiddleware = asyncHandler(async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken) {
        return res.status(401).json({ message: "Access token required" });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError" && refreshToken) {
            try {
                const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const newAccessToken = jwt.sign(
                    { userId: refreshDecoded.userId, email: refreshDecoded.email },
                    process.env.JWT_ACCESS_SECRET,
                    { expiresIn: "15m" }
                );
                
                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 15 * 60 * 1000
                });
                
                req.user = refreshDecoded;
                next();
            } catch (refreshError) {
                return res.status(401).json({ message: "Invalid refresh token" });
            }
        } else {
            return res.status(401).json({ message: "Invalid access token" });
        }
    }
});