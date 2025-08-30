import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {pool} from "../db/index.js";
import {generateToken, generateRefreshToken, verifyToken, verifyRefreshToken} from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import {v4 as uuidv4} from "uuid";

export const registerUser = asyncHandler(async(req, res) => {
    try {
        const {name, email, password, role} = req.body;

        if ([name, email, password].some((field) => !field || field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if(existing.length > 0) {
            throw new ApiError(400, "User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let userRole = 'staff';

        const [countRows] = await pool.query("SELECT COUNT(*) as count FROM users");
        if(countRows[0].count === 0) {
            userRole = "admin";
        }

        if(role && role === "admin" && countRows[0].count === 0) {
            userRole = "admin";
        }

        const [result] = await pool.query(
            `INSERT INTO users (name, email, password, refresh_token, role) VALUES(?, ?, ?, ?, ?)`, 
            [name, email, hashedPassword, "", userRole]
        )

        const [createdUser] = await pool.query(
            "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
            [result.insertId]
        )

        return res
            .status(201)
            .json(new ApiResponse(201, createdUser[0], "User registered successfully"));
        
    } catch (error) {
        console.log("Error while creating the user: ", error);
        return res
            .status(500)
            .json(new ApiError(500, `Internal Server Error: ${error}`));
    }
})