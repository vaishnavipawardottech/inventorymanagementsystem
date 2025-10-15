import express from "express";
import {  createPurchase, updatePurchase, deletePurchase } from "../controllers/purchases.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-purchase",authenticateToken, authorizeRoles("admin"), createPurchase);
// router.get("/purchases", getPurchases);
// router.get("/purchase/:id", getPurchaseById);
router.patch("/purchase/:id", authenticateToken, authorizeRoles("admin"), updatePurchase);
router.delete("/purchase/:id",authenticateToken, authorizeRoles("admin"), deletePurchase);

export default router;