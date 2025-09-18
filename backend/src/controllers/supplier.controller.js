import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


export const createSupplier = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name || !phone) {
    throw new ApiError(400, "Name and phone are required");
  }

  const [result] = await pool.query(
    `INSERT INTO suppliers (name, email, phone, address) VALUES (?, ?, ?, ?)`,
    [name, email, phone, address]
  );

  return res.status(201).json(
    new ApiResponse(201, { supplierId: result.insertId }, "Supplier created")
  );
});


export const getSuppliers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  // Count total
  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count 
     FROM suppliers 
     WHERE deleted_at IS NULL AND name LIKE ?`,
    [`%${search}%`]
  );

  // Fetch paginated
  const [rows] = await pool.query(
    `SELECT * FROM suppliers 
     WHERE deleted_at IS NULL AND name LIKE ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [`%${search}%`, parseInt(limit), parseInt(offset)]
  );

  return res.status(200).json(
    new ApiResponse(200, {
      suppliers: rows,
      total: countResult[0].count,
      totalPages: Math.ceil(countResult[0].count / limit),
      currentPage: parseInt(page),
    }, "Suppliers fetched successfully")
  );
});


export const getSupplierById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );

  if (rows.length === 0) {
    throw new ApiError(404, "Supplier not found");
  }

  return res.status(200).json(
    new ApiResponse(200, rows[0], "Supplier fetched successfully")
  );
});


export const updateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  const [result] = await pool.query(
    `UPDATE suppliers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ? AND deleted_at IS NULL`,
    [name, email, phone, address, id]
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Supplier not found or already deleted");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Supplier updated")
  );
});


export const deleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [result] = await pool.query(
    `UPDATE suppliers SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Supplier not found or already deleted");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Supplier deleted")
  );
});