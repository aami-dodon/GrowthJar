import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { recordAuditLog } from '../audit/audit.service.js';

const ENTRY_TYPES = ['good_thing', 'gratitude', 'better_choice'];

const ensureFamilyAccess = async ({ userId, familyId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw createHttpError(403, 'Family access denied');
  }
  return user;
};

export const createJarEntry = async ({ userId, entryType, content, metadata = {} }) => {
  if (!ENTRY_TYPES.includes(entryType)) {
    throw createHttpError(400, 'Unsupported entry type');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.familyId) {
    throw createHttpError(400, 'User must belong to a family');
  }

  if (user.role === 'child' && entryType === 'good_thing') {
    throw createHttpError(403, 'Children cannot add good things');
  }

  if (user.role === 'child' && entryType === 'better_choice' && !metadata.responseTo) {
    throw createHttpError(400, 'Child responses must reference a better choice entry');
  }

  if (user.role === 'parent' && entryType === 'gratitude') {
    metadata.target = metadata.target ?? 'rishi';
  }

  if (user.role === 'child' && entryType === 'gratitude') {
    if (!['mother', 'father'].includes(metadata.target)) {
      throw createHttpError(400, 'Child gratitude must target mother or father');
    }
  }

  const entry = await prisma.jarEntry.create({
    data: {
      familyId: user.familyId,
      userId,
      entryType,
      content,
      metadata,
    },
  });

  await recordAuditLog({ userId, action: 'JAR_ENTRY_CREATED', details: { entryId: entry.id, entryType } });
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

  const response = await prisma.jarEntry.create({
    data: {
      familyId: parentEntry.familyId,
      userId,
      entryType: 'better_choice',
      content,
      metadata: { responseTo: entryId, role: 'child' },
    },
  });

  await recordAuditLog({
    userId,
    action: 'JAR_ENTRY_RESPONDED',
    details: { entryId, responseId: response.id },
  });
  return response;
};
