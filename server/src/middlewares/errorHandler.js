import { logger } from '../config/logger.js';
import { AppError } from '../utils/errors.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const error = err instanceof AppError ? err : new AppError(err.message || 'Internal server error');
  logger.error({
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    details: error.details,
  });

  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message,
    details: error.details,
  });
};
