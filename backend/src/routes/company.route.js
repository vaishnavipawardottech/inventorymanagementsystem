import express from "express";
import { registerCompany, verifyCompany, getCompanyProfile, updateCompany, deleteCompany } from "../controllers/company.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register-company", authenticateToken, authorizeRoles("admin"), registerCompany);
router.post("/verify", verifyCompany);
router.get("/company/:id", authenticateToken, getCompanyProfile);
router.put("/company/:id", authenticateToken, authorizeRoles("admin"), updateCompany);
router.delete("/company/:id", authenticateToken, authorizeRoles("admin"), deleteCompany);

export default router;