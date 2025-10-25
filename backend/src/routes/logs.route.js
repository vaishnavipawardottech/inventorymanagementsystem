import express from "express";
import { getLogs } from "../controllers/logs.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/logs", authenticateToken, authorizeRoles("admin", "staff"), getLogs);

export default router;