import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { recordAuditLog } from '../audit/audit.service.js';

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  dailyReminder: true,
  weeklyReminder: true,
  entryAlerts: true,
  summaryEmail: true,
  preferredReflectionTime: 'Sunday evening',
};

const normalizePreferences = (record) => ({
  dailyReminder:
    typeof record?.dailyReminder === 'boolean'
      ? record.dailyReminder
      : DEFAULT_NOTIFICATION_PREFERENCES.dailyReminder,
  weeklyReminder:
    typeof record?.weeklyReminder === 'boolean'
      ? record.weeklyReminder
      : DEFAULT_NOTIFICATION_PREFERENCES.weeklyReminder,
  entryAlerts:
    typeof record?.entryAlerts === 'boolean'
      ? record.entryAlerts
      : DEFAULT_NOTIFICATION_PREFERENCES.entryAlerts,
  summaryEmail:
    typeof record?.summaryEmail === 'boolean'
      ? record.summaryEmail
      : DEFAULT_NOTIFICATION_PREFERENCES.summaryEmail,
  preferredReflectionTime:
    typeof record?.preferredReflectionTime === 'string' && record.preferredReflectionTime.trim().length > 0
      ? record.preferredReflectionTime
      : DEFAULT_NOTIFICATION_PREFERENCES.preferredReflectionTime,
});

const ensureFamilyMember = async ({ userId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.familyId) {
    throw createHttpError(403, 'Family membership required');
  }

  return user;
};

const sanitizePreferences = (preferences = {}) => {
  const sanitized = {
    dailyReminder:
      typeof preferences.dailyReminder === 'boolean'
        ? preferences.dailyReminder
        : DEFAULT_NOTIFICATION_PREFERENCES.dailyReminder,
    weeklyReminder:
      typeof preferences.weeklyReminder === 'boolean'
        ? preferences.weeklyReminder
        : DEFAULT_NOTIFICATION_PREFERENCES.weeklyReminder,
    entryAlerts:
      typeof preferences.entryAlerts === 'boolean'
        ? preferences.entryAlerts
        : DEFAULT_NOTIFICATION_PREFERENCES.entryAlerts,
    summaryEmail:
      typeof preferences.summaryEmail === 'boolean'
        ? preferences.summaryEmail
        : DEFAULT_NOTIFICATION_PREFERENCES.summaryEmail,
  };

  if (Object.prototype.hasOwnProperty.call(preferences, 'preferredReflectionTime')) {
    if (typeof preferences.preferredReflectionTime === 'string') {
      const trimmed = preferences.preferredReflectionTime.trim();
      sanitized.preferredReflectionTime = trimmed.length > 0 ? trimmed : null;
    } else {
      sanitized.preferredReflectionTime = null;
    }
  }

  return sanitized;
};

export const getNotificationPreferences = async ({ userId }) => {
  const user = await ensureFamilyMember({ userId });
  const record = await prisma.notificationPreference.findUnique({ where: { familyId: user.familyId } });
  return normalizePreferences(record);
};

export const getNotificationPreferencesByFamilyId = async (familyId) => {
  if (!familyId) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  const record = await prisma.notificationPreference.findUnique({ where: { familyId } });
  return normalizePreferences(record);
};

export const updateNotificationPreferences = async ({ userId, preferences }) => {
  const user = await ensureFamilyMember({ userId });
  const sanitized = sanitizePreferences(preferences);

  const saved = await prisma.notificationPreference.upsert({
    where: { familyId: user.familyId },
    update: sanitized,
    create: {
      familyId: user.familyId,
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...sanitized,
    },
  });

  await recordAuditLog({
    userId,
    action: 'NOTIFICATION_PREFERENCES_UPDATED',
    details: {
      familyId: user.familyId,
      preferences: sanitized,
    },
  });

  return normalizePreferences(saved);
};
