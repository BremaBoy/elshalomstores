import { Router } from 'express';
import * as refundController from '../controllers/refund.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/request', protect, refundController.requestRefund);

// Admin only
router.get('/', protect, authorize('admin', 'super_admin'), refundController.getAllRefunds);
router.patch('/:id', protect, authorize('admin', 'super_admin'), refundController.updateRefundStatus);

export default router;
