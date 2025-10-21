import express from "express";
import { registerCompany, verifyCompany, getCompanyProfile, updateCompany, deleteCompany, getAllCompanies, getMyCompany, updateCompanyInfo } from "../controllers/company.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register-company", authenticateToken, authorizeRoles("admin"), registerCompany);
router.post("/verify", verifyCompany);
router.get("/company/:id", authenticateToken, getCompanyProfile);
router.put("/company/:id", authenticateToken, authorizeRoles("admin"), updateCompany);
router.delete("/company/:id", authenticateToken, authorizeRoles("admin"), deleteCompany);
router.get("/companies", getAllCompanies);
router.get("/my-company", authenticateToken, getMyCompany);
router.put("/my-company", authenticateToken, updateCompanyInfo);

export default router;