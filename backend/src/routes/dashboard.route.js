import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/dashboard-stats', authenticateToken, authorizeRoles("admin", "staff"), getDashboardStats);

export default router;
