import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import familyRoutes from '../modules/families/families.routes.js';
import jarRoutes from '../modules/jarEntries/jarEntries.routes.js';
import notificationRoutes from '../modules/notifications/notifications.routes.js';
import exportRoutes from '../modules/exports/exports.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/families', familyRoutes);
router.use('/jar-entries', jarRoutes);
router.use('/notifications', notificationRoutes);
router.use('/exports', exportRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
