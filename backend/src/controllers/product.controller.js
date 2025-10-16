import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {pool} from "../db/index.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

function getStockStatus(stock, min_stock) {
    stock = parseInt(stock);
    min_stock = parseInt(min_stock);

    if (stock <= 0) {
        return 'out_of_stock';
    } else if (stock <= min_stock) {
        return 'low_stock';
    } else {
        return 'in_stock';
    }
}

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

    const stockStatus = getStockStatus(stock || 0, min_stock || 0);

    const [result] = await pool.query(
        `Insert INTO products (name, category, price, stock, min_stock, image_url, stock_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, category || null, price, stock || 0, min_stock || 0, imageUrl, stockStatus]
    );

    return res
    .status(201)
    .json(new ApiResponse(201, {id: result.insertId, name, category, price, stock, min_stock, imageUrl, stockStatus}, "Product added successfully"));
})

export const getProducts = asyncHandler(async(req, res) => {

    let {page = 1, limit = 10, search = "", category, stock_status} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM products WHERE deleted_at IS NULL`;
    let countQuery = `SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL`;
    let params = [];

    // search filter
    if (search) {
        query += ` AND (name LIKE ? OR category LIKE ?)`;
        countQuery += ` AND (name LIKE ? OR category LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    // category filter
    if (category && category !== "all") {
        query += ` AND category = ?`;
        countQuery += ` AND category = ?`;
        params.push(category);
    }

    // stock_status filter
    if (stock_status && stock_status !== "all") {
        query += ` AND stock_status = ?`;
        countQuery += ` AND stock_status = ?`;
        params.push(stock_status);
    }

    // order + pagination
    query += ` ORDER BY created_at LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // execute queries
    const [products] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params.slice(0,params.length - 2)); // exclude limit and offset for count query
    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    return res
            .status(200)
            .json(new ApiResponse(200, {products, totalProducts, totalPages, currentPage: page}, "Products fetched successfully"));

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

    const stockStatus = getStockStatus(stock || 0, min_stock || 0);

    await pool.query(
        `UPDATE products SET name = ?, category = ?, price = ?, stock = ?, min_stock = ?, image_url = ?, stock_status = ? WHERE id = ?`,
        [
        name || existingProduct[0].name,
        category || existingProduct[0].category,
        price || existingProduct[0].price,
        stock || existingProduct[0].stock,
        min_stock || existingProduct[0].min_stock,
        imageUrl,
        stockStatus,
        id
    ]
    )

    return res
    .status(200)
    .json(new ApiResponse(200, "Product updated successfully", {id, name, category, price, stock, min_stock, imageUrl, stockStatus}));
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

export const getAllProductsSimple = asyncHandler(async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT id, name, price, stock_status FROM products WHERE deleted_at IS NULL ORDER BY name`
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          "All products fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to fetch products"));
  }
});
