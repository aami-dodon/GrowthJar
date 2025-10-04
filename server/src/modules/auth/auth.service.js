import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { signToken } from '../../utils/jwt.js';
import { recordAuditLog } from '../audit/audit.service.js';
import { sendEmailVerification, sendPasswordResetEmail } from '../../integrations/email/email.service.js';
import { env } from '../../config/env.js';

const SALT_ROUNDS = 12;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createVerificationToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = hashToken(token);
  const expiresAt = new Date(Date.now() + env.verificationTokenExpiresMinutes * 60 * 1000);
  await prisma.emailVerificationToken.create({
    data: {
      tokenHash: hashed,
      userId,
      expiresAt,
    },
  });
  return token;
};

const createResetToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = hashToken(token);
  const expiresAt = new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashed,
      userId,
      expiresAt,
    },
  });
  return token;
};

export const signup = async ({ email, password, role, firstName, lastName, familyId }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createHttpError(409, 'Account already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      role,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      familyId: familyId ?? null,
    },
  });

  const verificationToken = await createVerificationToken(user.id);
  await sendEmailVerification({ email: user.email, token: verificationToken });
  await recordAuditLog({ userId: user.id, action: 'USER_SIGNED_UP', details: { role } });

  return user;
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw createHttpError(401, 'Invalid credentials');
  }

  if (!user.emailVerified) {
    throw createHttpError(403, 'Email verification required');
  }

  const token = signToken({ sub: user.id, role: user.role, familyId: user.familyId });
  await recordAuditLog({ userId: user.id, action: 'USER_LOGGED_IN' });
  return { token, user };
};

export const verifyEmail = async ({ token }) => {
  const hashed = hashToken(token);
  const record = await prisma.emailVerificationToken.findFirst({
    where: { tokenHash: hashed },
  });

  if (!record || record.expiresAt < new Date()) {
    throw createHttpError(400, 'Invalid or expired verification token');
  }

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: {
      emailVerified: true,
    },
  });

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  await recordAuditLog({ userId: user.id, action: 'USER_EMAIL_VERIFIED' });

  return user;
};

export const requestPasswordReset = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }
  const token = await createResetToken(user.id);
  await sendPasswordResetEmail({ email: user.email, token });
  await recordAuditLog({ userId: user.id, action: 'USER_PASSWORD_RESET_REQUESTED' });
  return token;
};

export const resetPassword = async ({ token, newPassword }) => {
  const hashed = hashToken(token);
  const record = await prisma.passwordResetToken.findFirst({ where: { tokenHash: hashed } });
  if (!record || record.expiresAt < new Date()) {
    throw createHttpError(400, 'Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await recordAuditLog({ userId: user.id, action: 'USER_PASSWORD_RESET' });
  return user;
};
