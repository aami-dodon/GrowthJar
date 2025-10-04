import crypto from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { recordAuditLog } from '../audit/audit.service.js';
import { sendFamilyInviteEmail } from '../../integrations/email/email.service.js';
import { env } from '../../config/env.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const createFamily = async ({ familyName, userId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (user.role !== 'parent') {
    throw createHttpError(403, 'Only parents can create families');
  }

  if (user.familyId) {
    throw createHttpError(400, 'User already assigned to a family');
  }

  const family = await prisma.family.create({
    data: {
      familyName: familyName ?? null,
      members: {
        connect: { id: userId },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { familyId: family.id },
  });

  await recordAuditLog({ userId, action: 'FAMILY_CREATED', details: { familyId: family.id } });
  return family;
};

export const getFamily = async ({ familyId, userId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw createHttpError(403, 'Access denied');
  }

  return prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

export const inviteMember = async ({ email, role, familyId, inviterId }) => {
  const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
  if (!inviter || inviter.familyId !== familyId) {
    throw createHttpError(403, 'Inviter must belong to the family');
  }

  if (inviter.role !== 'parent') {
    throw createHttpError(403, 'Only parents can invite members');
  }

  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) {
    throw createHttpError(404, 'Family not found');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const hashed = hashToken(token);
  const expiresAt = new Date(Date.now() + env.verificationTokenExpiresMinutes * 60 * 1000);

  await prisma.familyInvitation.create({
    data: {
      familyId,
      email,
      role,
      tokenHash: hashed,
      expiresAt,
      invitedById: inviterId,
    },
  });

  await sendFamilyInviteEmail({ email, token, familyName: family.familyName ?? 'Rishi\'s Jar Family' });
  await recordAuditLog({ userId: inviterId, action: 'FAMILY_MEMBER_INVITED', details: { email, role } });

  return token;
};

export const acceptInvitation = async ({ token, firstName, lastName }) => {
  const hashed = hashToken(token);
  const invitation = await prisma.familyInvitation.findFirst({ where: { tokenHash: hashed } });
  if (!invitation || invitation.expiresAt < new Date()) {
    throw createHttpError(400, 'Invalid invitation');
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (!existingUser) {
    throw createHttpError(404, 'Invited user must sign up before accepting');
  }

  if (existingUser.familyId && existingUser.familyId !== invitation.familyId) {
    throw createHttpError(400, 'User already in another family');
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      familyId: invitation.familyId,
      firstName: firstName ?? existingUser.firstName,
      lastName: lastName ?? existingUser.lastName,
    },
  });

  await prisma.familyInvitation.delete({ where: { id: invitation.id } });
  await recordAuditLog({
    userId: existingUser.id,
    action: 'FAMILY_MEMBER_JOINED',
    details: { familyId: invitation.familyId },
  });

  return invitation;
};
