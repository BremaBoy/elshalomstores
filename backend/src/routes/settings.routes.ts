import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Publicly readable? (e.g. store name) - actually let's keep it admin for now
router.get('/', protect, settingsController.getSettings);

// Admin only
router.post('/', protect, authorize('admin', 'super_admin'), settingsController.updateSettings);

export default router;
