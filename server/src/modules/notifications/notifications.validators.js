import { body, query } from 'express-validator';

export const sendNotificationRules = [
  body('familyId').isUUID().withMessage('familyId is required'),
  body('type').isIn(['daily', 'weekly']).withMessage('Invalid notification type'),
];

export const listNotificationRules = [
  query('family_id').isUUID().withMessage('family_id is required'),
];
