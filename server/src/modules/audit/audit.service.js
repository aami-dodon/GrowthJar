import { prisma } from '../../config/prisma.js';
import { logger } from '../../config/logger.js';

export const recordAuditLog = async ({ userId, action, details = {} }) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      details,
    },
  });
  logger.info({ message: 'Audit log recorded', action, userId });
};
