import { Router } from 'express';
import * as activityLogController from '../controllers/activityLog.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, authorize('admin', 'super_admin'));

router.get('/', activityLogController.getActivityLogs);

export default router;
