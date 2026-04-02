import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/image', protect, authorize('admin', 'super_admin'), uploadController.uploadMiddleware, uploadController.uploadImage);

export default router;
