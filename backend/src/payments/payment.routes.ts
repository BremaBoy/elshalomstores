import { Router } from 'express';
import * as paymentController from './payment.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Customer actions
router.post('/:gateway/initialize', protect, paymentController.initializePayment);
router.post('/retry', protect, paymentController.retryPayment);
router.get('/:gateway/verify/:reference', protect, paymentController.verifyPaymentEndpoint);

// Admin actions
router.post('/refund', protect, authorize('admin', 'super_admin'), paymentController.refundPayment);
router.get('/', protect, authorize('admin', 'super_admin'), paymentController.getPayments);

export default router;
