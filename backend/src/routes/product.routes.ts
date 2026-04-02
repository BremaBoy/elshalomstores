import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);

// Admin only routes
router.post('/', protect, authorize('admin', 'super_admin'), productController.createProduct);
router.patch('/:id', protect, authorize('admin', 'super_admin'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin', 'super_admin'), productController.deleteProduct);

export default router;
