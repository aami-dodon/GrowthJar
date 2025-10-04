import { query } from 'express-validator';

export const exportRules = [
  query('family_id').isUUID().withMessage('family_id is required'),
  query('period').optional().isIn(['weekly', 'monthly', 'all']).withMessage('Invalid period'),
];
