import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All wishlist routes are protected
router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:id', wishlistController.removeFromWishlist);

export default router;
