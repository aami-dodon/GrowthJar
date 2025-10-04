import { Router } from 'express';
import {
  handleCreateFamily,
  handleGetFamily,
  handleInviteMember,
  handleAcceptInvite,
} from './families.controller.js';
import {
  createFamilyRules,
  inviteRules,
  acceptInviteRules,
  familyIdParamRule,
} from './families.validators.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.post('/', authenticate, requirePermission('family:create'), createFamilyRules, handleCreateFamily);
router.get('/:id', authenticate, familyIdParamRule, handleGetFamily);
router.post(
  '/invite',
  authenticate,
  requirePermission('family:invite'),
  inviteRules,
  handleInviteMember,
);
router.post('/accept-invite', acceptInviteRules, handleAcceptInvite);

export default router;
