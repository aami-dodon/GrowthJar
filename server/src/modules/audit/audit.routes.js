import { Router } from 'express';
import { listAuditLogs } from './audit.controller.js';
import { requireSystemAccess } from '../../middlewares/systemAccessMiddleware.js';

const router = Router();

router.get('/', requireSystemAccess, listAuditLogs);

export default router;
