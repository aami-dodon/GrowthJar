import { body, param, query } from 'express-validator';

export const createEntryRules = [
  body('entryType').isIn(['good_thing', 'gratitude', 'better_choice']).withMessage('Invalid entry type'),
  body('content').isLength({ min: 1 }).withMessage('Content required'),
  body('metadata').optional().isObject().withMessage('metadata must be an object'),
];

export const listEntriesRules = [
  query('family_id').optional().isUUID().withMessage('family_id must be UUID'),
  query('filter').optional().isIn(['good_thing', 'gratitude', 'better_choice']).withMessage('Invalid filter'),
];

export const entryIdParamRule = [param('id').isUUID().withMessage('id must be UUID')];

export const updateEntryRules = [
  body('content').isLength({ min: 1 }).withMessage('Content required'),
  body('metadata').optional().isObject().withMessage('metadata must be an object'),
];

export const respondRules = [
  body('content').isLength({ min: 1 }).withMessage('Response content required'),
];

export const summaryRules = [
  query('family_id').isUUID().withMessage('family_id is required'),
  query('period').optional().isIn(['weekly', 'all']).withMessage('Invalid period'),
];
