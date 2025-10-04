import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { recordAuditLog } from '../audit/audit.service.js';

export const sendNotification = async ({ familyId, userId, type }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw createHttpError(403, 'Access denied');
  }

  const notification = await prisma.notification.create({
    data: {
      familyId,
      type,
      sentAt: new Date(),
    },
  });

  await recordAuditLog({ userId, action: 'NOTIFICATION_SENT', details: { type, familyId } });
  return notification;
};

export const listNotifications = async ({ familyId, userId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw createHttpError(403, 'Access denied');
  }

  return prisma.notification.findMany({
    where: { familyId },
    orderBy: { sentAt: 'desc' },
  });
};
