import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const [logs] = await pool.query(
    `
    SELECT l.*, u.username, u.role
    FROM logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?;
    `,
    [parseInt(limit), parseInt(offset)]
  );

  const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM logs`);
  const total = countResult[0].total;

  res.status(200).json(
    new ApiResponse(200, {
      logs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    }, "Logs fetched successfully")
  );
});
