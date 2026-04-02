import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Customer + Admin
router.post('/', protect, orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);

// Admin only
router.get('/', protect, authorize('admin', 'super_admin'), orderController.getAllOrders);
router.patch('/:id/status', protect, authorize('admin', 'super_admin'), orderController.updateOrderStatus);

export default router;
