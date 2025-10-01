import express from "express";
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, searchProducts } from "../controllers/sales.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-order",authenticateToken, createOrder);
router.get("/orders", getOrders);
router.get("/order/:id", getOrderById);
router.patch("/order/:id", authenticateToken, authorizeRoles("admin", "staff"), updateOrder);
router.delete("/order/:id",authenticateToken, authorizeRoles("admin", "staff"), deleteOrder);
router.get("/orders/search",authenticateToken, searchProducts);

export default router;