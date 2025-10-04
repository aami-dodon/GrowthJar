import { body, param } from 'express-validator';
import { USER_ROLES } from '../../shared/constants/roles.js';

export const createFamilyRules = [
  body('familyName').optional().isLength({ min: 1 }).withMessage('familyName must not be empty'),
];

export const inviteRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('role').isIn(Object.values(USER_ROLES)).withMessage('Invalid role'),
  body('familyId').optional().isUUID().withMessage('familyId must be a UUID'),
];

export const acceptInviteRules = [
  body('token').isLength({ min: 10 }).withMessage('Invitation token required'),
  body('firstName').optional().isLength({ min: 1 }).withMessage('First name must not be empty'),
  body('lastName').optional().isLength({ min: 1 }).withMessage('Last name must not be empty'),
];

export const familyIdParamRule = [param('id').isUUID().withMessage('Family id must be a UUID')];
