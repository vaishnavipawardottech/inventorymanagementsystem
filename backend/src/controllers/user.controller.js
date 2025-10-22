import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {pool} from "../db/index.js";
import {generateToken, generateRefreshToken, verifyToken, verifyRefreshToken} from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import {v4 as uuidv4} from "uuid";

// export const registerUser = asyncHandler(async(req, res) => {
//     try {
//         const { username, email, password, role, isCompanyMember, companyName } = req.body;

//         if ([username, email, password].some((field) => !field || field.trim() === "")) {
//             throw new ApiError(400, "All fields are required");
//         }

//         const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
//         if(existing.length > 0) {
//             throw new ApiError(400, "User with this email already exists");
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         let userRole = 'staff';

//         const [countRows] = await pool.query("SELECT COUNT(*) as count FROM users");
//         if(countRows[0].count === 0) {
//             userRole = "admin";
//         } else if(role && role === "admin") {
//             userRole = "admin";
//         }

//         // company association with user
//         let companyId = null;
//         if (isCompanyMember && companyName) {
//             const [companyRows] = await pool.query(
//                 `SELECT id FROM companies WHERE company_name = ? AND deleted_at IS NULL`,
//                 [companyName.trim()]
//             );
//             if (companyRows.length === 0) {
//                 throw new ApiError(404, "no company found with this name")
//             }

//             companyId = companyRows[0].id;
//         }

//         const [result] = await pool.query(
//             `INSERT INTO users (username, email, password, refresh_token, role, company_id) VALUES(?, ?, ?, ?, ?, ?)`, 
//             [username, email, hashedPassword, "", userRole, companyId]
//         )

//         const [createdUser] = await pool.query(
//             "SELECT id, username, email, role, company_id, created_at, updated_at, deleted_at FROM users WHERE id = ?",
//             [result.insertId]
//         )

//         if (companyId) {
//             if (userRole === "admin") {
//                 await pool.query("UPDATE companies SET no_of_admin = no_of_admin + 1 WHERE id = ?", [companyId]);
//             } else {
//                 await pool.query("UPDATE companies SET no_of_staff = no_of_staff + 1 WHERE id = ?", [companyId]);
//             }
//         }

//         return res
//             .status(201)
//             .json(new ApiResponse(201, createdUser[0], "User registered successfully"));
        
//     } catch (error) {
//         console.log("Error while creating the user: ", error);
//         return res
//             .status(500)
//             .json(new ApiError(500, `Internal Server Error: ${error}`));
//     }
// })

export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password, role, isCompanyMember, companyName } = req.body;

    if ([username, email, password].some((field) => !field || field.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    // check if user already exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      throw new ApiError(400, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check how many users exist in the system
    const [countRows] = await pool.query("SELECT COUNT(*) as count FROM users");
    const isFirstUser = countRows[0].count === 0;

    // Check how many companies exist
    const [companyCountRows] = await pool.query("SELECT COUNT(*) as companyCount FROM companies WHERE deleted_at IS NULL");
    const companyExists = companyCountRows[0].companyCount > 0;

    let userRole = "staff";
    let companyId = null;

    // 1️) If this is the first user → make them admin
    if (isFirstUser) {
      userRole = "admin";
    }
    // 2) If user explicitly selects admin role later (optional logic)
    else if (role && role === "admin") {
      userRole = "admin";
    }

    // 3) Handle company membership
    if (isCompanyMember && companyName) {
      const [companyRows] = await pool.query(
        `SELECT id FROM companies WHERE company_name = ? AND deleted_at IS NULL`,
        [companyName.trim()]
      );

      if (companyRows.length === 0) {
        throw new ApiError(404, "No company found with this name");
      }

      companyId = companyRows[0].id;
    } else if (!isCompanyMember && !companyExists && isFirstUser) {
      // This is the first ever user and no company exists
      // They will register successfully but need to register a company afterward
      companyId = null;
    } else if (!isCompanyMember && companyExists) {
      // If companies exist but user didn’t choose one
      throw new ApiError(400, "Please select a company or mark yourself as a company member");
    }

    // 4) Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password, refresh_token, role, company_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, "", userRole, companyId]
    );

    const [createdUser] = await pool.query(
      "SELECT id, username, email, role, company_id, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    // 5) Update company stats if applicable
    if (companyId) {
      if (userRole === "admin") {
        await pool.query("UPDATE companies SET no_of_admin = no_of_admin + 1 WHERE id = ?", [companyId]);
      } else {
        await pool.query("UPDATE companies SET no_of_staff = no_of_staff + 1 WHERE id = ?", [companyId]);
      }
    }

    // 6) If it's the first user and no company exists
    if (isFirstUser && !companyExists) {
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { user: createdUser[0], needsCompanyRegistration: true },
            "User registered successfully — please register your company next."
          )
        );
    }

    // 7) Default response
    return res.status(201).json(new ApiResponse(201, createdUser[0], "User registered successfully"));
  } catch (error) {
    console.log("Error while creating the user: ", error);
    return res.status(500).json(new ApiError(500, `Internal Server Error: ${error}`));
  }
});


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
            role: user.role,
            username: user.username,
            company_id: user.company_id
        };

        const accessToken = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        const cookieOptions = {
            httpOnly: true,     // not accessible by JS (prevents XSS)
            secure: process.env.NODE_ENV === "production", // only https in prod
            sameSite: "strict",      // prevents CSRF
        }

        await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

        delete user.password;
        delete user.refresh_token;

        // Set cookies
        res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

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

        res.clearCookie("accessToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });

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

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        if (!refreshToken) {
            throw new ApiError(401, "Refresh token not provided");
        }

        const decoded = verifyRefreshToken(refreshToken);

        const [users] = await pool.query(
            `SELECT * FROM users WHERE id = ?`, [decoded.id]
        )

        if (users.length === 0 || users[0].refresh_token !== refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const newAccessToken = generateToken({
            id: users[0].id,
            email: users[0].email,
            role: users[0].role
        })

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res
            .status(200)
            .json(new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed successfully"));
        
    } catch (error) {
        throw new ApiError(401, "Could not refresh token");
    }
})

export const getProfile = asyncHandler(async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, username, email, role, created_at, updated_at
                FROM users
                WHERE id = ? AND deleted_at IS NULL`,
            [req.user.id]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .jason(new ApiResponse(404, null, "User not found"));
        }

        const user = rows[0];

        return res
            .status(200)
            .json(new ApiResponse(200, user, "User profile fetched successfully"));
        
    } catch (error) {
        res
            .status(500)
            .json({success: false, message: "Server error"})
    }
})