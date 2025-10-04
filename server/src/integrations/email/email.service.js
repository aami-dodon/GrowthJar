import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { deliverEmail } from './email.client.js';

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
};

const buildUrl = (pathname, token) => {
  try {
    const url = new URL(env.clientAppUrl);
    url.pathname = pathname;
    url.searchParams.set('token', token);
    return url.toString();
  } catch (error) {
    logger.warn({ message: 'Unable to build URL from clientAppUrl', clientAppUrl: env.clientAppUrl, error });
    return `${env.clientAppUrl.replace(/\/$/, '')}${pathname}?token=${token}`;
  }
};

/**
 * Sends an email verification link to a user.
 *
 * @param {{ email: string, token: string }} params
 * @returns {Promise<void>}
 */
export const sendEmailVerification = async ({ email, token }) => {
  const verificationUrl = buildUrl('/verify-email', token);
  logger.info({ message: 'Queued email verification', to: maskEmail(email) });
  await deliverEmail({
    from: env.emailFrom,
    to: email,
    subject: 'Verify your email for Rishi\'s Jar',
    text: `Verify your email by visiting: ${verificationUrl}`,
  });
};

/**
 * Sends a password reset email containing a reset link.
 *
 * @param {{ email: string, token: string }} params
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async ({ email, token }) => {
  const resetUrl = buildUrl('/reset-password', token);
  logger.info({ message: 'Queued password reset email', to: maskEmail(email) });
  await deliverEmail({
    from: env.emailFrom,
    to: email,
    subject: 'Reset your password for Rishi\'s Jar',
    text: `Reset your password by visiting: ${resetUrl}`,
  });
};

/**
 * Sends a family invite email to a prospective member.
 *
 * @param {{ email: string, token: string, familyName: string }} params
 * @returns {Promise<void>}
 */
export const sendFamilyInviteEmail = async ({ email, token, familyName }) => {
  const inviteUrl = buildUrl('/accept-invite', token);
  logger.info({ message: 'Queued family invitation email', to: maskEmail(email) });
  await deliverEmail({
    from: env.emailFrom,
    to: email,
    subject: `You have been invited to ${familyName} on Rishi's Jar`,
    text: `Accept your invite by visiting: ${inviteUrl}`,
  });
};
