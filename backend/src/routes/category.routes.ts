import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin only routes
router.post('/', protect, authorize('admin', 'super_admin'), categoryController.createCategory);
router.patch('/:id', protect, authorize('admin', 'super_admin'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('admin', 'super_admin'), categoryController.deleteCategory);

export default router;
