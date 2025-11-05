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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


// export const getDashboardTrends = asyncHandler(async (req, res) => {
//   const selectedYear = req.query.year || new Date().getFullYear();

//   // Stock Movements (Incoming vs Outgoing)
//   const [stockMovements] = await pool.query(
//     `
//     WITH months AS (
//       SELECT 1 AS month_num, 'Jan' AS month_name UNION ALL
//       SELECT 2, 'Feb' UNION ALL
//       SELECT 3, 'Mar' UNION ALL
//       SELECT 4, 'Apr' UNION ALL
//       SELECT 5, 'May' UNION ALL
//       SELECT 6, 'Jun' UNION ALL
//       SELECT 7, 'Jul' UNION ALL
//       SELECT 8, 'Aug' UNION ALL
//       SELECT 9, 'Sep' UNION ALL
//       SELECT 10, 'Oct' UNION ALL
//       SELECT 11, 'Nov' UNION ALL
//       SELECT 12, 'Dec'
//     )
//     SELECT 
//       m.month_name AS month,
//       COALESCE(SUM(pi.quantity), 0) AS incoming,
//       COALESCE((
//         SELECT SUM(si.quantity)
//         FROM sales s
//         JOIN sale_items si ON s.id = si.sale_id
//         WHERE YEAR(s.created_at) = ? AND MONTH(s.created_at) = m.month_num
//       ), 0) AS outgoing
//     FROM months m
//     LEFT JOIN purchases p ON YEAR(p.created_at) = ? AND MONTH(p.created_at) = m.month_num
//     LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
//     GROUP BY m.month_num, m.month_name
//     ORDER BY m.month_num;
//     `,
//     [selectedYear, selectedYear]
//   );

//   // Stock Value
//   const [stockValueResult] = await pool.query(`
//     SELECT 
//       SUM(price * stock) AS total_stock_value,
//       COUNT(*) AS total_products,
//       SUM(stock) AS total_quantity
//     FROM products
//     WHERE deleted_at IS NULL;
//   `);

//   const stockValue = {
//     total_value: parseFloat(stockValueResult[0].total_stock_value || 0).toFixed(2),
//     total_products: stockValueResult[0].total_products || 0,
//     total_quantity: stockValueResult[0].total_quantity || 0,
//   };

//   // Top Outgoing Products
//   const [topOutgoing] = await pool.query(`
//     SELECT 
//       p.name AS product_name,
//       SUM(si.quantity) AS total_sold
//     FROM sale_items si
//     JOIN products p ON si.product_id = p.id
//     GROUP BY p.id
//     ORDER BY total_sold DESC
//     LIMIT 5;
//   `);

//   res.status(200).json(
//     new ApiResponse(200, {
//       year: selectedYear,
//       stockMovements,
//       stockValue,
//       topOutgoing,
//     }, "Dashboard trends fetched successfully")
//   );
// });

export const getDashboardTrends = asyncHandler(async (req, res) => {
  const selectedYear = req.query.year || new Date().getFullYear();

  // Stock Movements (Incoming vs Outgoing)
  const [stockMovements] = await pool.query(
    `
    WITH months AS (
      SELECT 1 AS month_num, 'Jan' AS month_name UNION ALL
      SELECT 2, 'Feb' UNION ALL
      SELECT 3, 'Mar' UNION ALL
      SELECT 4, 'Apr' UNION ALL
      SELECT 5, 'May' UNION ALL
      SELECT 6, 'Jun' UNION ALL
      SELECT 7, 'Jul' UNION ALL
      SELECT 8, 'Aug' UNION ALL
      SELECT 9, 'Sep' UNION ALL
      SELECT 10, 'Oct' UNION ALL
      SELECT 11, 'Nov' UNION ALL
      SELECT 12, 'Dec'
    )
    SELECT 
      m.month_name AS month,
      COALESCE(SUM(pi.quantity), 0) AS incoming,
      COALESCE((SELECT SUM(si.quantity)
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        WHERE YEAR(s.created_at) = ? AND MONTH(s.created_at) = m.month_num
      ), 0) AS outgoing
    FROM months m
    LEFT JOIN purchases p ON YEAR(p.created_at) = ? AND MONTH(p.created_at) = m.month_num
    LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
    GROUP BY m.month_num, m.month_name
    ORDER BY m.month_num;
    `,
    [selectedYear, selectedYear]
  );

  // Stock Value
  const [stockValueResult] = await pool.query(`
    SELECT 
      SUM(price * stock) AS total_stock_value,
      COUNT(*) AS total_products,
      SUM(stock) AS total_quantity
    FROM products
    WHERE deleted_at IS NULL;
  `);

  const stockValue = {
    total_value: parseFloat(stockValueResult[0].total_stock_value || 0).toFixed(2),
    total_products: stockValueResult[0].total_products || 0,
    total_quantity: stockValueResult[0].total_quantity || 0,
  };

  // Top 5 Outgoing Products (with price, stock, status)
  const [topOutgoing] = await pool.query(`
    SELECT 
      p.name AS product_name,
      p.price,
      p.stock,
      p.stock_status,
      SUM(si.quantity) AS total_sold
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    WHERE p.deleted_at IS NULL
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 5;
  `);

  // Send all trends data
  res.status(200).json(
    new ApiResponse(200, {
      year: selectedYear,
      stockMovements,
      stockValue,
      topOutgoing,
    }, "Dashboard trends fetched successfully")
  );
});

