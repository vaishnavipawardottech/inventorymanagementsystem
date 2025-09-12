import express from "express";
import { addProduct, getProducts, getProductById, updateProductById, deleteProductById } from "../controllers/product.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/add-product", upload.single('productImage'), addProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", upload.single('productImage'), updateProductById);
router.delete("/products/:id", deleteProductById);

export default router;