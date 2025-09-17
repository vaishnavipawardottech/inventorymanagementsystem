import express from "express";
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder } from "../controllers/orders.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-order",authenticateToken, authorizeRoles("admin", "staff"), createOrder);
router.get("/orders", getOrders);
router.get("/order/:id", getOrderById);
router.patch("/order/:id", authenticateToken, authorizeRoles("admin", "staff"), updateOrder);
router.delete("/order/:id",authenticateToken, authorizeRoles("admin", "staff"), deleteOrder);

export default router;