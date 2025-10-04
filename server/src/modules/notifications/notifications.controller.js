import { validationResult } from 'express-validator';
import { sendNotification, listNotifications } from './notifications.service.js';
import { createHttpError } from '../../utils/errors.js';

const ensureValid = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createHttpError(422, 'Validation failed', errors.array());
  }
};

export const handleSendNotification = async (req, res, next) => {
  try {
    ensureValid(req);
    const notification = await sendNotification({
      familyId: req.body.familyId,
      userId: req.user.id,
      type: req.body.type,
    });
    res.status(201).json({ status: 'success', data: notification });
  } catch (error) {
    next(error);
  }
};

export const handleListNotifications = async (req, res, next) => {
  try {
    ensureValid(req);
    const notifications = await listNotifications({
      familyId: req.query.family_id,
      userId: req.user.id,
    });
    res.json({ status: 'success', data: notifications });
  } catch (error) {
    next(error);
  }
};
