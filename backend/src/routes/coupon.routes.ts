import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/validate', protect, couponController.validateCoupon);

// Admin only
router.get('/', protect, authorize('admin', 'super_admin'), couponController.getCoupons);
router.post('/', protect, authorize('admin', 'super_admin'), couponController.createCoupon);
router.patch('/:id', protect, authorize('admin', 'super_admin'), couponController.updateCoupon);
router.delete('/:id', protect, authorize('admin', 'super_admin'), couponController.deleteCoupon);

export default router;
