import { body } from 'express-validator';

export const updateNotificationPreferencesRules = [
  body('dailyReminder')
    .isBoolean()
    .withMessage('Daily reminder preference must be a boolean'),
  body('weeklyReminder')
    .isBoolean()
    .withMessage('Weekly reminder preference must be a boolean'),
  body('entryAlerts')
    .isBoolean()
    .withMessage('Entry alert preference must be a boolean'),
  body('summaryEmail')
    .isBoolean()
    .withMessage('Weekly summary preference must be a boolean'),
  body('preferredReflectionTime')
    .optional({ nullable: true })
    .isString()
    .withMessage('Preferred reflection time must be a string')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Preferred reflection time must be between 2 and 120 characters'),
];
