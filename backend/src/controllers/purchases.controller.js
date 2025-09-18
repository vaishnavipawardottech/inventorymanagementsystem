import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const createPurchase = asyncHandler(async (req, res) => {
  const { supplier_id, items } = req.body;
  const created_by = req.user.id; 

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let totalAmount = 0;

    // Insert into purchases (total_amount will be updated later)
    const [purchaseResult] = await connection.query(
      `INSERT INTO purchases (supplier_id, total_amount, created_by) VALUES (?, ?, ?)`,
      [supplier_id, 0, created_by]
    );
    const purchaseId = purchaseResult.insertId;

    // Insert items and update stock
    for (let item of items) {
      const [product] = await connection.query(
        `SELECT price, stock FROM products WHERE id = ?`,
        [item.product_id]
      );
      if (product.length === 0)
        throw new ApiError(404, `Product ${item.product_id} not found`);

      totalAmount += item.price * item.quantity;

      await connection.query(
        `INSERT INTO purchase_items (purchase_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [purchaseId, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        `UPDATE products SET stock = stock + ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // Update total
    await connection.query(
      `UPDATE purchases SET total_amount = ? WHERE id = ?`,
      [totalAmount, purchaseId]
    );

    await connection.commit();
    return res
      .status(201)
      .json(new ApiResponse(201, { purchaseId }, "Purchase created successfully"));
  } catch (error) {
    await connection.rollback();
    throw new ApiError(500, error.message || "Failed to create purchase");
  } finally {
    connection.release();
  }
});


export const getPurchases = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, s.name as supplier_name, u.username as created_by_name
     FROM purchases p
     LEFT JOIN suppliers s ON p.supplier_id = s.id
     LEFT JOIN users u ON p.created_by = u.id
     WHERE p.deleted_at IS NULL
     ORDER BY p.created_at DESC`
  );

  return res.status(200).json(new ApiResponse(200, rows, "Purchases fetched"));
});


export const getPurchaseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [purchase] = await pool.query(
    `SELECT p.*, s.name as supplier_name, u.username as created_by_name
     FROM purchases p
     LEFT JOIN suppliers s ON p.supplier_id = s.id
     LEFT JOIN users u ON p.created_by = u.id
     WHERE p.id = ? AND p.deleted_at IS NULL`,
    [id]
  );

  if (purchase.length === 0) throw new ApiError(404, "Purchase not found");

  const [items] = await pool.query(
    `SELECT pi.*, pr.name as product_name 
     FROM purchase_items pi
     LEFT JOIN products pr ON pi.product_id = pr.id
     WHERE pi.purchase_id = ?`,
    [id]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { ...purchase[0], items }, "Purchase details"));
});


export const updatePurchase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // restore stock from old items
    const [oldItems] = await connection.query(
      `SELECT product_id, quantity FROM purchase_items WHERE purchase_id = ?`,
      [id]
    );
    for (let old of oldItems) {
      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [old.quantity, old.product_id]
      );
    }

    // delete old items
    await connection.query(`DELETE FROM purchase_items WHERE purchase_id = ?`, [
      id,
    ]);

    // insert new items and update stock
    let totalAmount = 0;
    for (let item of items) {
      totalAmount += item.price * item.quantity;

      await connection.query(
        `INSERT INTO purchase_items (purchase_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [id, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        `UPDATE products SET stock = stock + ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.query(
      `UPDATE purchases SET total_amount = ? WHERE id = ?`,
      [totalAmount, id]
    );

    await connection.commit();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Purchase updated successfully"));
  } catch (error) {
    await connection.rollback();
    throw new ApiError(500, error.message || "Failed to update purchase");
  } finally {
    connection.release();
  }
});


export const deletePurchase = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // restore stock before delete
    const [items] = await connection.query(
      `SELECT product_id, quantity FROM purchase_items WHERE purchase_id = ?`,
      [id]
    );
    for (let item of items) {
      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.query(`UPDATE purchases SET deleted_at = NOW() WHERE id = ?`, [id]);

    await connection.commit();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Purchase deleted successfully"));
  } catch (error) {
    await connection.rollback();
    throw new ApiError(500, error.message || "Failed to delete purchase");
  } finally {
    connection.release();
  }
});