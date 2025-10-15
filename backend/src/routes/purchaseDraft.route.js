import express from "express";
import { createDraft, getDrafts, getDraftById, sendDraft, getSuppliers, getOrderedPurchases, getDeliveredPurchases, markAsDelivered, updateDraft, updatePurchasePrice, getPurchaseById } from "../controllers/purchaseDraft.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-draft",authenticateToken, authorizeRoles("admin"), createDraft);
router.get("/drafts", getDrafts);
router.get("/draft/:id", getDraftById);
router.post("/send-draft/:id", authenticateToken, authorizeRoles("admin"), sendDraft);
router.get("/get-suppliers",authenticateToken, authorizeRoles("admin"), getSuppliers);
router.get("/ordered",authenticateToken, authorizeRoles("admin"), getOrderedPurchases);
router.get("/delivered", authenticateToken, authorizeRoles("admin"), getDeliveredPurchases);
router.put("/delivered/:id", authenticateToken, authorizeRoles("admin"), markAsDelivered);
router.put("/draft/:id", authenticateToken, authorizeRoles("admin"), updateDraft);
router.put("/update-price/:id", authenticateToken, authorizeRoles("admin"), updatePurchasePrice);
router.get("/purchases/:purchaseId", authenticateToken, authorizeRoles("admin"), getPurchaseById);

export default router;