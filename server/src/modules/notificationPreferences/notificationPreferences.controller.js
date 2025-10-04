import { validationResult } from 'express-validator';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from './notificationPreferences.service.js';
import { createHttpError } from '../../utils/errors.js';

const ensureValid = (req) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw createHttpError(422, 'Validation failed', result.array());
  }
};

export const handleGetNotificationPreferences = async (req, res, next) => {
  try {
    const preferences = await getNotificationPreferences({ userId: req.user.id });
    res.json({ status: 'success', data: preferences });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateNotificationPreferences = async (req, res, next) => {
  try {
    ensureValid(req);
    const preferences = await updateNotificationPreferences({
      userId: req.user.id,
      preferences: req.body,
    });
    res.json({ status: 'success', data: preferences });
  } catch (error) {
    next(error);
  }
};
