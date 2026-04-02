import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All cart routes are protected
router.use(protect);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.patch('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
