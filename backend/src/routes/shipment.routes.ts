import { Router } from 'express';
import * as shipmentController from '../controllers/shipment.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/order/:order_id', protect, shipmentController.getShipmentByOrder);

// Admin only
router.post('/', protect, authorize('admin', 'super_admin'), shipmentController.createShipment);
router.patch('/:id', protect, authorize('admin', 'super_admin'), shipmentController.updateShipmentStatus);

export default router;
