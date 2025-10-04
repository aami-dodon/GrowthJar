import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { recordAuditLog } from '../audit/audit.service.js';
import {
  sendDailyReminderEmail,
  sendWeeklyReflectionEmail,
} from '../../integrations/email/email.service.js';
import { childProfile } from '../../shared/constants/childProfile.js';

const ENTRY_TYPES = ['good_thing', 'gratitude', 'better_choice'];

const resolveFamilyMemberLabel = (entry, members) => {
  const authorRole = entry.metadata?.author;
  if (authorRole === 'mom') return 'Mom';
  if (authorRole === 'dad') return 'Dad';
  if (authorRole === 'child') return childProfile.name;

  const member = members.find((candidate) => candidate.id === entry.userId);
  if (member?.firstName) {
    return member.lastName ? `${member.firstName} ${member.lastName}` : member.firstName;
  }

  if (authorRole && typeof authorRole === 'string') {
    return authorRole.charAt(0).toUpperCase() + authorRole.slice(1);
  }

  return 'A family member';
};

const mapEntriesForEmail = (entries, members) =>
  entries.map((entry) => ({
    type: entry.entryType,
    content: entry.content ?? '',
    createdAt: entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt),
    authorLabel: resolveFamilyMemberLabel(entry, members),
  }));

const summarizeEntries = (entries) =>
  ENTRY_TYPES.map((type) => ({
    type,
    count: entries.filter((entry) => entry.entryType === type).length,
  })).filter((item) => item.count > 0);

const formatTriggeredBy = (user) => {
  if (user.familyRole === 'mom') return 'Mom';
  if (user.familyRole === 'dad') return 'Dad';
  if (user.familyRole === 'child') return childProfile.name;
  if (user.firstName) {
    return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
  }
  return null;
};

export const sendNotification = async ({ familyId, userId, type }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      familyId: true,
      firstName: true,
      lastName: true,
      familyRole: true,
      role: true,
    },
  });
  if (!user || user.familyId !== familyId) {
    throw createHttpError(403, 'Access denied');
  }

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          familyRole: true,
        },
      },
    },
  });

  if (!family) {
    throw createHttpError(404, 'Family not found');
  }

  const recipients = family.members.map((member) => member.email).filter(Boolean);
  if (recipients.length === 0) {
    throw createHttpError(400, 'Family has no email recipients configured');
  }

  const triggeredBy = formatTriggeredBy(user);
  const now = new Date();
  let notification;

  if (type === 'daily') {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const entries = await prisma.jarEntry.findMany({
      where: {
        familyId,
        createdAt: { gte: startOfDay },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, familyRole: true },
        },
      },
    });

    await sendDailyReminderEmail({
      recipients,
      familyName: family.familyName,
      triggeredBy,
      entries: mapEntriesForEmail(entries, family.members),
      date: now,
    });

    notification = await prisma.notification.create({
      data: {
        familyId,
        type,
        sentAt: now,
      },
    });
  } else if (type === 'weekly') {
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const entries = await prisma.jarEntry.findMany({
      where: {
        familyId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, familyRole: true },
        },
      },
    });

    const mappedEntries = mapEntriesForEmail(entries, family.members);
    const summary = summarizeEntries(entries);

    await sendWeeklyReflectionEmail({
      recipients,
      familyName: family.familyName,
      triggeredBy,
      entries: mappedEntries,
      summary,
      totalEntries: entries.length,
      range: { start: since, end: now },
    });

    notification = await prisma.notification.create({
      data: {
        familyId,
        type,
        sentAt: now,
      },
    });
  } else {
    throw createHttpError(400, 'Unsupported notification type');
  }

  await recordAuditLog({
    userId,
    action: 'NOTIFICATION_SENT',
    details: {
      type,
      familyId,
      recipients: recipients.length,
    },
  });
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
