import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, authorize('admin', 'super_admin'));

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/sales', analyticsController.getSalesReport);

export default router;
