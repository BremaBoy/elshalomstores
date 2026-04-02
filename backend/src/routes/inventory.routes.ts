import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// All inventory routes are admin/super_admin only
router.use(protect, authorize('admin', 'super_admin'));

router.get('/logs', inventoryController.getInventoryLogs);
router.post('/update', inventoryController.updateStock);
router.get('/low-stock', inventoryController.getLowStockAlerts);

export default router;
