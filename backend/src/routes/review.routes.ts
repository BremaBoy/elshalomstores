import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/product/:product_id', reviewController.getProductReviews);

router.post('/', protect, reviewController.createReview);
router.delete('/:id', protect, reviewController.deleteReview);

export default router;
