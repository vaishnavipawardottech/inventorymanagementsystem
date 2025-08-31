import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {pool} from "../db/index.js";
import {generateToken, generateRefreshToken, verifyToken, verifyRefreshToken} from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import {v4 as uuidv4} from "uuid";

export const registerUser = asyncHandler(async(req, res) => {
    try {
        const {username, email, password, role} = req.body;

        if ([username, email, password].some((field) => !field || field.trim() === "")) {
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
            `INSERT INTO users (username, email, password, refresh_token, role) VALUES(?, ?, ?, ?, ?)`, 
            [username, email, hashedPassword, "", userRole]
        )

        const [createdUser] = await pool.query(
            "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
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

export const loginUser = asyncHandler(async(req, res) => {
    try {
        const { email, password } = req.body;
        
        if(!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            throw new ApiError(400, "Invalid email or password");
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(400, "Invalid email or password");
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

        delete user.password;
        delete user.refresh_token;

        return res
            .status(200)
            .json({
                status: "success",
                data: {
                    user,
                    accessToken,
                    refreshToken
                }
                });

    } catch (error) {
        console.log("Error while logging in user: ", error);
        return res
            .status(500)
            .json(new ApiError(500, `Internal Server Error: ${error}`));
    }
})

export const logout = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        await pool.query("UPDATE users SET refresh_token = NULL where id = ?", [userId]);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "User logged out successfully"));
    } catch (error) {
        console.log("Error while logging out: ", error);
        return res
            .status(500)
            .json(new ApiError(500, `Internal Server Error: ${error}`));
    }
})