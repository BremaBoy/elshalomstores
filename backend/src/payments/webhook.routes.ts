import { Router } from 'express';
import * as webhookController from './webhook.controller';

const router = Router();

// Webhook endpoints (no authentication middleware as they are called by external services)
router.post('/paystack', webhookController.paystackWebhook);
router.post('/flutterwave', webhookController.flutterwaveWebhook);

export default router;
