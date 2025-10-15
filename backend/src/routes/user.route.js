import express from "express";
import { registerUser, loginUser, logout, getProfile } from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateToken, logout);
router.get("/profile", authenticateToken, getProfile);

export default router;