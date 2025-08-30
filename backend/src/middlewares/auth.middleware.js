import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res
            .status(401)
            .json(new ApiError(401, "Authentication token is required"));
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Invalid or expired token", error);
        return res
           .status(401)
           .json(new ApiError(401, "Invalid or expired token"));
    }
}