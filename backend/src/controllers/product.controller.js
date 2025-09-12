import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {pool} from "../db/index.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const addProduct = asyncHandler(async(req, res) => {
    const {name, category, price, stock, min_stock} = req.body;

    if (!name || !price) {
        throw new ApiError(400, "name and price are required");
    }

    const[existingProduct] = await pool.query(
        `SELECT id FROM products WHERE name = ? AND deleted_at IS NULL LIMIT 1`,
        [name]
    )
    if(existingProduct.length > 0) {
        throw new ApiError(409, "Product with this name already exists");
    }

    let imageUrl = null;
    if (req.file?.path) {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

        if(!cloudinaryResponse) {
            throw new ApiError(500, "Failed to upload image");
        }
        console.log(cloudinaryResponse);
        
        imageUrl = cloudinaryResponse.url;
    }

    const [result] = await pool.query(
        `Insert INTO products (name, category, price, stock, min_stock, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, category || null, price, stock || 0, min_stock || 0, imageUrl]
    );

    return res
    .status(201)
    .json(new ApiResponse(201, "Product added successfully", {id: result.insertId, name, category, price, stock, min_stock, imageUrl}));
})

export const getProducts = asyncHandler(async(req, res) => {
    const [products] = await pool.query(
        `SELECT * FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC`
    )

    return res
    .status(200)
    .json(new ApiResponse(200, "Products fetched successfully", {products}))
})

export const getProductById = asyncHandler(async(req, res) => {
    const {id} = req.params;
    const [products] = await pool.query(
        `SELECT * FROM products WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );

    if (products.length === 0) {
        throw new ApiError(404, "Product not found");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, "Product fetched successfully", {product: products[0]}))
})

export const updateProductById = asyncHandler(async(req, res) => {
    const {id} = req.params;
    const {name, category, price, stock, min_stock} = req.body;

    const [existingProduct] = await pool.query(
        `SELECT * FROM products WHERE id = ?`,
        [id]
    )

    if (!existingProduct.length) {
        throw new ApiError(404, "Product not found");
    }

    let imageUrl = existingProduct[0].image_url;
    if (req.file?.productImage?.[0]?.path) {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.productImage[0].path);
        if(!cloudinaryResponse) {
            throw new ApiError(500, "Failed to upload image");
        }
        imageUrl = cloudinaryResponse.url;
    }

    await pool.query(
        `UPDATE products SET name = ?, category = ?, price = ?, stock = ?, min_stock = ?, image_url = ? WHERE id = ?`,
        [
        name || existingProduct[0].name,
        category || existingProduct[0].category,
        price || existingProduct[0].price,
        stock || existingProduct[0].stock,
        min_stock || existingProduct[0].min_stock,
        imageUrl,
        id
    ]
    )

    return res
    .status(200)
    .json(new ApiResponse(200, "Product updated successfully", {id, name, category, price, stock, min_stock, imageUrl}));
})

export const deleteProductById = asyncHandler(async(req, res) => {
    const {id} = req.params;
    const[existingProduct] = await pool.query(
        `SELECT * FROM products WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );
    if (existingProduct.length === 0) {
        throw new ApiError(404, "Product not found");
    }

    await pool.query(
        `UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id]
    );

    return res
    .status(200)
    .json(new ApiResponse(200, "Product deleted successfully", {id}));

})