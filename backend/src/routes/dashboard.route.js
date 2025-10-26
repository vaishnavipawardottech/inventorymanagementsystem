import express from 'express';
import { getDashboardStats, getDashboardTrends } from '../controllers/dashboard.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/dashboard-stats', authenticateToken, authorizeRoles("admin", "staff"), getDashboardStats);
router.get('/trends', authenticateToken, authorizeRoles("admin", "staff"), getDashboardTrends);

export default router;
