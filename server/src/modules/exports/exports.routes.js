import { Router } from 'express';
import { handleExportCsv, handleExportPdf } from './exports.controller.js';
import { exportRules } from './exports.validators.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/csv', authenticate, exportRules, handleExportCsv);
router.get('/pdf', authenticate, exportRules, handleExportPdf);

export default router;
