import express from "express";
import { addProduct, getProducts, getProductById, updateProductById, deleteProductById } from "../controllers/product.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/products", getProducts);
router.get("/products/:id", getProductById);

router.post("/add-product",authenticateToken,authorizeRoles("admin"), upload.single('image'), addProduct);
router.patch("/products/:id", authenticateToken, authorizeRoles("admin"), upload.single('image'), updateProductById);
router.delete("/products/:id", authenticateToken, authorizeRoles("admin"), deleteProductById);

export default router;