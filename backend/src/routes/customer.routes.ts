import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, authorize('admin', 'super_admin'));

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id/suspend', customerController.suspendCustomer);

export default router;
