import { Router } from 'express';
import { handleSendNotification, handleListNotifications } from './notifications.controller.js';
import { sendNotificationRules, listNotificationRules } from './notifications.validators.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.post(
  '/send',
  authenticate,
  requirePermission('jar:create:good_thing'),
  sendNotificationRules,
  handleSendNotification,
);
router.get('/', authenticate, listNotificationRules, handleListNotifications);

export default router;
