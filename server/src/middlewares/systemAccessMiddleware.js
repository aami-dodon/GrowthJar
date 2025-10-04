import { env } from '../config/env.js';
import { createHttpError } from '../utils/errors.js';

export const requireSystemAccess = (req, res, next) => {
  if (!env.systemAccessToken) {
    return next(createHttpError(503, 'System access token not configured'));
  }

  const token = req.headers['x-system-token'];
  if (token !== env.systemAccessToken) {
    return next(createHttpError(403, 'System access denied'));
  }

  return next();
};
