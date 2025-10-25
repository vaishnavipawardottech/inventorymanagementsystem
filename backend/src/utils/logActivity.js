import { pool } from "../db/index.js";

/**
 * Log user activity
 * @param {number} userId - The ID of the admin/staff performing the action
 * @param {string} actionType - The type of action (e.g., "ADD_PRODUCT", "CREATE_DRAFT")
 * @param {string} description - A human-readable message of what happened
 */
export const logActivity = async (userId, actionType, description) => {
  try {
    await pool.query(
      `INSERT INTO logs (user_id, action_type, description) VALUES (?, ?, ?)`,
      [userId, actionType, description]
    );
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};