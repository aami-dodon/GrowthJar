import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
};

export const sendEmailVerification = async ({ email, token }) => {
  logger.info({ message: 'Queued email verification', to: maskEmail(email) });
  return {
    from: env.emailFrom,
    to: email,
    template: 'verify-email',
    metadata: { token },
  };
};

export const sendPasswordResetEmail = async ({ email, token }) => {
  logger.info({ message: 'Queued password reset email', to: maskEmail(email) });
  return {
    from: env.emailFrom,
    to: email,
    template: 'reset-password',
    metadata: { token },
  };
};

export const sendFamilyInviteEmail = async ({ email, token, familyName }) => {
  logger.info({ message: 'Queued family invitation email', to: maskEmail(email) });
  return {
    from: env.emailFrom,
    to: email,
    template: 'family-invite',
    metadata: { token, familyName },
  };
};
