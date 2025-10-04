import { body } from 'express-validator';
import { USER_ROLES } from '../../shared/constants/roles.js';
import { FAMILY_ROLES, FAMILY_ROLE_TO_USER_ROLE } from '../../shared/constants/familyRoles.js';

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

const normalizeEmailInput = (value) => value?.trim().toLowerCase();

export const signupRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .customSanitizer(normalizeEmailInput),
  passwordRule,
  body('role').isIn(Object.values(USER_ROLES)).withMessage('Invalid role'),
  body('familyRole')
    .isIn(Object.values(FAMILY_ROLES))
    .withMessage('familyRole must be mom, dad, or rishi')
    .bail()
    .custom((familyRole, { req }) => {
      const expectedRole = FAMILY_ROLE_TO_USER_ROLE[familyRole];
      if (req.body.role !== expectedRole) {
        throw new Error(`familyRole ${familyRole} requires role ${expectedRole}`);
      }
      return true;
    }),
  body('firstName').isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').optional().isLength({ min: 1 }).withMessage('Last name must not be empty'),
  body('familyId').optional().isUUID().withMessage('familyId must be a UUID'),
];

export const loginRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .customSanitizer(normalizeEmailInput),
  passwordRule,
];

export const verifyEmailRules = [
  body('token').isLength({ min: 10 }).withMessage('Verification token required'),
];

export const requestResetRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .customSanitizer(normalizeEmailInput),
];

export const resetPasswordRules = [
  body('token').isLength({ min: 10 }).withMessage('Reset token required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];
