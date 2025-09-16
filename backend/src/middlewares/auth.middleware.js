import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticateToken = (req, res, next) => {
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];

    // if (!token) {
    //     return res
    //         .status(401)
    //         .json(new ApiError(401, "Authentication token is required"));
    // }

    try {
        const token = req.cookies.accessToken;
        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded;
            next(); 
        } catch (error) {
            throw new ApiError(401, "Invalid or expired token");
        }    
    } catch (error) {
        next(error);
    }
}

export const authorizeRoles = (...allowedRoles) => {
    return asyncHandler(async(req, res, next) => {
        if (!req.user?.role) {
            throw new ApiError(403, "user role not found");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, "you don't have permission to access this resource");
        }

        next();
    })
}