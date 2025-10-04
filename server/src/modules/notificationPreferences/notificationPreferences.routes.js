import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  handleGetNotificationPreferences,
  handleUpdateNotificationPreferences,
} from './notificationPreferences.controller.js';
import { updateNotificationPreferencesRules } from './notificationPreferences.validators.js';

const router = Router();

router.get('/', authenticate, handleGetNotificationPreferences);
router.put('/', authenticate, updateNotificationPreferencesRules, handleUpdateNotificationPreferences);

export default router;
