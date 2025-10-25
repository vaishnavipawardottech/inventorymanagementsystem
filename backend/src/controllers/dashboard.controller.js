import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const [staffResult] = await pool.query(
      "SELECT COUNT(*) AS total_staff FROM users WHERE role='staff' AND deleted_at IS NULL"
    );

    const [adminResult] = await pool.query(
      "SELECT COUNT(*) AS total_admins FROM users WHERE role='admin' AND deleted_at IS NULL"
    );

    const [supplierResult] = await pool.query(
      "SELECT COUNT(*) AS total_suppliers FROM suppliers WHERE deleted_at IS NULL"
    );

    const [customerResult] = await pool.query(
      "SELECT COUNT(*) AS total_customers FROM customers WHERE deleted_at IS NULL"
    );

    const [productResult] = await pool.query(
      "SELECT COUNT(*) AS total_products FROM products WHERE deleted_at IS NULL"
    );

    const [lowStockResult] = await pool.query(
      "SELECT COUNT(*) AS low_stock_items FROM products WHERE stock_status IN ('low_stock', 'out_of_stock')"
    );

    // Combine results neatly
    const stats = {
      total_staff: staffResult[0].total_staff,
      total_admins: adminResult[0].total_admins,
      total_suppliers: supplierResult[0].total_suppliers,
      total_customers: customerResult[0].total_customers,
      total_products: productResult[0].total_products,
      low_stock_items: lowStockResult[0].low_stock_items,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
