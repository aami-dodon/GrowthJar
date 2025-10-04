import { Router } from 'express';
import {
  handleCreateEntry,
  handleListEntries,
  handleGetEntry,
  handleUpdateEntry,
  handleDeleteEntry,
  handleSummary,
  handleTimeline,
  handleRespond,
} from './jarEntries.controller.js';
import {
  createEntryRules,
  listEntriesRules,
  entryIdParamRule,
  updateEntryRules,
  respondRules,
  summaryRules,
} from './jarEntries.validators.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.post('/', authenticate, createEntryRules, handleCreateEntry);
router.get('/', authenticate, listEntriesRules, handleListEntries);
router.get('/summary/data', authenticate, summaryRules, handleSummary);
router.get('/timeline/data', authenticate, listEntriesRules, handleTimeline);
router.post(
  '/:id/respond',
  authenticate,
  requirePermission('jar:respond:better_choice'),
  entryIdParamRule,
  respondRules,
  handleRespond,
);
router.get('/:id', authenticate, entryIdParamRule, handleGetEntry);
router.put(
  '/:id',
  authenticate,
  requirePermission('jar:create:good_thing'),
  entryIdParamRule,
  updateEntryRules,
  handleUpdateEntry,
);
router.delete(
  '/:id',
  authenticate,
  requirePermission('jar:create:good_thing'),
  entryIdParamRule,
  handleDeleteEntry,
);

export default router;
