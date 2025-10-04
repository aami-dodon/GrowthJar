import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { recordAuditLog } from '../audit/audit.service.js';
import { FAMILY_ROLES } from '../../shared/constants/familyRoles.js';
import { childProfile } from '../../shared/constants/childProfile.js';
import { sendEntryNotificationEmail } from '../../integrations/email/email.service.js';
import { logger } from '../../config/logger.js';
import { getNotificationPreferencesByFamilyId } from '../notificationPreferences/notificationPreferences.service.js';

const ENTRY_TYPES = ['good_thing', 'gratitude', 'better_choice'];

const ensureFamilyAccess = async ({ userId, familyId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw createHttpError(403, 'Family access denied');
  }
  return user;
};

const canonicalizeFamilyRole = (value) => {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['mom', 'mother'].includes(normalized)) return FAMILY_ROLES.MOM;
  if (['dad', 'father'].includes(normalized)) return FAMILY_ROLES.DAD;
  if (['child', 'kid'].includes(normalized)) return FAMILY_ROLES.CHILD;
  return normalized;
};

const canonicalizeTarget = (value) => {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['child', 'kid'].includes(normalized)) return 'child';
  if (['mom', 'mother'].includes(normalized)) return 'mother';
  if (['dad', 'father'].includes(normalized)) return 'father';
  return normalized;
};

const notifyFamilyOfNewEntry = async ({ entry, author }) => {
  if (!author.familyId) {
    return;
  }

  try {
    const preferences = await getNotificationPreferencesByFamilyId(author.familyId);

    if (!preferences.entryAlerts) {
      logger.info({
        message: 'Entry alerts disabled, skipping notification emails',
        entryId: entry.id,
        familyId: author.familyId,
      });
      return;
    }

    const recipients = await prisma.user.findMany({
      where: {
        familyId: author.familyId,
        emailVerified: true,
        NOT: { id: author.id },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (recipients.length === 0) {
      return;
    }

    const authorName = author.firstName ?? author.email;
    await Promise.all(
      recipients
        .filter((member) => member.email)
        .map((member) =>
          sendEntryNotificationEmail({
            to: member.email,
            entryType: entry.entryType,
            content: entry.content,
            authorName,
            recipientName: member.firstName ?? undefined,
          }).catch((error) => {
            logger.error({
              message: 'Failed to send entry notification email',
              error,
              entryId: entry.id,
              recipient: member.email,
            });
          })
        )
    );
  } catch (error) {
    logger.error({
      message: 'Failed to queue entry notification emails',
      error,
      entryId: entry.id,
      familyId: author.familyId,
    });
  }
};

export const createJarEntry = async ({ userId, entryType, content, metadata = {} }) => {
  if (!ENTRY_TYPES.includes(entryType)) {
    throw createHttpError(400, 'Unsupported entry type');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.familyId) {
    throw createHttpError(400, 'User must belong to a family');
  }

  const familyRole = canonicalizeFamilyRole(user.familyRole);
  const incomingMetadata = metadata ?? {};
  const sanitizedMetadata = { ...incomingMetadata };
  sanitizedMetadata.author = canonicalizeFamilyRole(sanitizedMetadata.author);
  sanitizedMetadata.target = canonicalizeTarget(sanitizedMetadata.target);

  if (user.role === 'child' && entryType === 'good_thing') {
    throw createHttpError(403, 'Children cannot add good things');
  }

  if (user.role === 'parent') {
    if (![FAMILY_ROLES.MOM, FAMILY_ROLES.DAD].includes(familyRole)) {
      throw createHttpError(403, 'Parent account must be assigned to Mom or Dad');
    }

    if (sanitizedMetadata.author && sanitizedMetadata.author !== familyRole) {
      throw createHttpError(403, 'Parents can only submit entries as themselves');
    }

    sanitizedMetadata.author = familyRole;

    if (['good_thing', 'gratitude', 'better_choice'].includes(entryType)) {
      if (sanitizedMetadata.target && sanitizedMetadata.target !== 'child') {
        throw createHttpError(403, `Parents can only target ${childProfile.name} with these entries`);
      }
      sanitizedMetadata.target = 'child';
    }

    if (entryType === 'better_choice' && sanitizedMetadata.responseTo) {
      throw createHttpError(400, 'Parents cannot respond to better choice entries');
    }
    delete sanitizedMetadata.responseTo;
  }

  if (user.role === 'child') {
    if (familyRole !== FAMILY_ROLES.CHILD) {
      throw createHttpError(403, `Only ${childProfile.name} can submit child entries`);
    }

    if (sanitizedMetadata.author && sanitizedMetadata.author !== FAMILY_ROLES.CHILD) {
      throw createHttpError(403, 'Children can only submit entries as themselves');
    }

    sanitizedMetadata.author = FAMILY_ROLES.CHILD;

    if (entryType === 'gratitude') {
      if (!['mother', 'father'].includes(sanitizedMetadata.target)) {
        throw createHttpError(400, 'Child gratitude must target mother or father');
      }
    }

    if (entryType === 'better_choice') {
      if (!sanitizedMetadata.responseTo) {
        throw createHttpError(400, 'Child responses must reference a better choice entry');
      }
      sanitizedMetadata.target = sanitizedMetadata.target ?? 'child';
    }
  }

  const entry = await prisma.jarEntry.create({
    data: {
      familyId: user.familyId,
      userId,
      entryType,
      content,
      metadata: sanitizedMetadata,
    },
  });

  await recordAuditLog({ userId, action: 'JAR_ENTRY_CREATED', details: { entryId: entry.id, entryType } });
  await notifyFamilyOfNewEntry({ entry, author: user });
  return entry;
};

export const listJarEntries = async ({ userId, familyId, filter }) => {
  const user = await ensureFamilyAccess({ userId, familyId });
  const where = { familyId: user.familyId };
  if (filter && ENTRY_TYPES.includes(filter)) {
    where.entryType = filter;
  }
  return prisma.jarEntry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const getJarEntry = async ({ id, userId }) => {
  const entry = await prisma.jarEntry.findUnique({ where: { id } });
  if (!entry) {
    throw createHttpError(404, 'Entry not found');
  }
  await ensureFamilyAccess({ userId, familyId: entry.familyId });
  return entry;
};

export const updateJarEntry = async ({ id, userId, content, metadata }) => {
  const entry = await prisma.jarEntry.findUnique({ where: { id } });
  if (!entry) {
    throw createHttpError(404, 'Entry not found');
  }
  const user = await ensureFamilyAccess({ userId, familyId: entry.familyId });
  if (user.role !== 'parent') {
    throw createHttpError(403, 'Only parents can update entries');
  }

  const updated = await prisma.jarEntry.update({
    where: { id },
    data: { content, metadata },
  });
  await recordAuditLog({ userId, action: 'JAR_ENTRY_UPDATED', details: { entryId: id } });
  return updated;
};

export const deleteJarEntry = async ({ id, userId }) => {
  const entry = await prisma.jarEntry.findUnique({ where: { id } });
  if (!entry) {
    throw createHttpError(404, 'Entry not found');
  }
  const user = await ensureFamilyAccess({ userId, familyId: entry.familyId });
  if (user.role !== 'parent') {
    throw createHttpError(403, 'Only parents can delete entries');
  }

  await prisma.jarEntry.delete({ where: { id } });
  await recordAuditLog({ userId, action: 'JAR_ENTRY_DELETED', details: { entryId: id } });
  return true;
};

export const summarizeJarEntries = async ({ userId, familyId, period = 'weekly' }) => {
  await ensureFamilyAccess({ userId, familyId });
  const since = period === 'weekly' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : new Date(0);
  const entries = await prisma.jarEntry.groupBy({
    by: ['entryType'],
    where: {
      familyId,
      createdAt: { gte: since },
    },
    _count: { _all: true },
  });

  return entries.map((item) => ({ entryType: item.entryType, count: item._count._all }));
};

export const listTimeline = async ({ userId, familyId }) => {
  await ensureFamilyAccess({ userId, familyId });
  return prisma.jarEntry.findMany({
    where: { familyId },
    orderBy: { createdAt: 'asc' },
  });
};

export const respondToBetterChoice = async ({ entryId, userId, content }) => {
  const parentEntry = await prisma.jarEntry.findUnique({ where: { id: entryId } });
  if (!parentEntry || parentEntry.entryType !== 'better_choice') {
    throw createHttpError(404, 'Better choice entry not found');
  }

  const user = await ensureFamilyAccess({ userId, familyId: parentEntry.familyId });
  if (user.role !== 'child') {
    throw createHttpError(403, 'Only children can respond to better choices');
  }
  if (canonicalizeFamilyRole(user.familyRole) !== FAMILY_ROLES.CHILD) {
      throw createHttpError(403, `Only ${childProfile.name} can respond to better choices`);
  }

  const response = await prisma.jarEntry.create({
    data: {
      familyId: parentEntry.familyId,
      userId,
      entryType: 'better_choice',
      content,
      metadata: {
        responseTo: entryId,
        role: 'child',
        author: FAMILY_ROLES.CHILD,
      },
    },
  });

  await recordAuditLog({
    userId,
    action: 'JAR_ENTRY_RESPONDED',
    details: { entryId, responseId: response.id },
  });
  return response;
};
