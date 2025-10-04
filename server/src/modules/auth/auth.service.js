import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { signToken } from '../../utils/jwt.js';
import { recordAuditLog } from '../audit/audit.service.js';
import { sendEmailVerification, sendPasswordResetEmail } from '../../integrations/email/email.service.js';
import { env } from '../../config/env.js';
import { FAMILY_ROLES, FAMILY_ROLE_TO_USER_ROLE } from '../../shared/constants/familyRoles.js';

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

const normalizeEmail = (value) => value?.trim().toLowerCase();

const resolveFamily = async () => {
  const existingFamily = await prisma.family.findFirst({ select: { id: true } });
  if (existingFamily?.id) {
    return { id: existingFamily.id, created: false };
  }

  const createdFamily = await prisma.family.create({ data: {}, select: { id: true } });
  return { id: createdFamily.id, created: true };
};

const assertAllowedSignup = (email, familyRole, role) => {
  const normalizedRole = typeof familyRole === 'string' ? familyRole.trim().toLowerCase() : null;
  if (!normalizedRole || !Object.values(FAMILY_ROLES).includes(normalizedRole)) {
    throw createHttpError(400, 'Unsupported family role');
  }

  const expectedRole = FAMILY_ROLE_TO_USER_ROLE[normalizedRole];
  if (expectedRole !== role) {
    throw createHttpError(400, 'Role is not permitted for the selected family member');
  }

  const allowedEmail = env.allowedFamilyEmails[normalizedRole];
  if (!allowedEmail) {
    throw createHttpError(500, 'Family role is not configured for signups');
  }

  if (normalizeEmail(email) !== normalizeEmail(allowedEmail)) {
    throw createHttpError(403, 'This email is not authorized for the selected family member');
  }
};

export const signup = async ({ email, password, role, familyRole, firstName, lastName }) => {
  const normalizedRole = typeof familyRole === 'string' ? familyRole.trim().toLowerCase() : familyRole;
  assertAllowedSignup(email, normalizedRole, role);

  const normalizedEmail = normalizeEmail(email);

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw createHttpError(409, 'Account already exists');
  }

  const existingRole = await prisma.user.findUnique({ where: { familyRole: normalizedRole } });
  if (existingRole) {
    throw createHttpError(409, 'This family member has already been registered');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const { id: resolvedFamilyId, created: familyCreated } = await resolveFamily();

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      role,
      familyRole: normalizedRole,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      familyId: resolvedFamilyId,
    },
  });

  const verificationToken = await createVerificationToken(user.id);
  await sendEmailVerification({ email: user.email, token: verificationToken });
  await recordAuditLog({
    userId: user.id,
    action: 'USER_SIGNED_UP',
    details: { role, familyRole },
  });

  if (familyCreated) {
    await recordAuditLog({
      userId: user.id,
      action: 'FAMILY_CREATED',
      details: { familyId: resolvedFamilyId, origin: 'signup' },
    });
  }

  return user;
};

export const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
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
