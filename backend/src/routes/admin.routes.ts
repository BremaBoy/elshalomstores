import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, authorize('super_admin'));

router.get('/manage', adminController.getAllAdmins);
router.patch('/:id/role', adminController.updateAdminRole);

export default router;
