import express from "express";
import { createDraft, getDrafts, getDraftById, sendDraft, getSuppliers } from "../controllers/purchaseDraft.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-draft",authenticateToken, authorizeRoles("admin"), createDraft);
router.get("/drafts", getDrafts);
router.get("/draft/:id", getDraftById);
router.post("/send-draft/:id", authenticateToken, authorizeRoles("admin"), sendDraft);
router.get("/get-suppliers",authenticateToken, authorizeRoles("admin"), getSuppliers);

export default router;