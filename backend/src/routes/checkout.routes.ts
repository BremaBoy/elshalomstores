import { Router } from 'express';
import * as checkoutController from '../controllers/checkout.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/prepare', protect, checkoutController.prepareCheckout);

export default router;
