import express from "express";
import { createSupplier, getSuppliers, getSupplierById, updateSupplier, deleteSupplier } from "../controllers/supplier.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-supplier",authenticateToken, authorizeRoles("admin"), createSupplier);
router.get("/suppliers", getSuppliers);
router.get("/supplier/:id", getSupplierById);
router.patch("/supplier/:id", authenticateToken, authorizeRoles("admin"), updateSupplier);
router.delete("/supplier/:id",authenticateToken, authorizeRoles("admin"), deleteSupplier);

export default router;