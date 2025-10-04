import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { childProfile } from '../../shared/constants/childProfile.js';
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

const renderTemplate = ({
  title,
  previewText,
  introLines,
  action,
  footerLines,
}) => {
  const introHtml = introLines
    .map((line) => `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#1f2937;">${line}</p>`)
    .join('');

  const footerHtml = (footerLines ?? [])
    .map((line) => `<p style="margin:0 0 8px;font-size:14px;line-height:20px;color:#4b5563;">${line}</p>`)
    .join('');

  const buttonHtml = action
    ? `<a href="${action.url}" style="display:inline-block;padding:14px 32px;border-radius:9999px;background:#3b83f6;color:#ffffff;font-weight:600;text-decoration:none;">${action.label}</a>`
    : '';

  const linkHtml = action
    ? `<p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#6b7280;word-break:break-word;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${action.url}" style="color:#3b83f6;text-decoration:underline;">${action.url}</a></p>`
    : '';

  const preview = previewText ?? '';

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        @media (max-width: 640px) {
          .container {
            padding: 24px !important;
          }
          h1 {
            font-size: 24px !important;
            line-height: 32px !important;
          }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;">${preview}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;padding:40px;box-shadow:0 30px 60px -40px rgba(15,33,89,0.35);">
              <tr>
                <td style="text-align:center;">
                  <div style="display:inline-flex;width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,#3b83f6,#38b36a);align-items:center;justify-content:center;color:#ffffff;font-size:24px;font-weight:700;margin-bottom:24px;">RJ</div>
                  <h1 style="margin:0 0 16px;font-size:28px;line-height:36px;color:#0f172a;">${title}</h1>
                </td>
              </tr>
              <tr>
                <td>
                  ${introHtml}
                  <div style="margin:24px 0;text-align:center;">
                    ${buttonHtml}
                  </div>
                  ${linkHtml}
                  <div style="margin-top:32px;">
                    ${footerHtml}
                  </div>
                  <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:#9ca3af;">This message was sent by ${childProfile.jarName} • A gratitude ritual for families.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

const renderText = (lines) => lines.filter(Boolean).join('\n\n');

/**
 * Sends an email verification link to a user.
 *
 * @param {{ email: string, token: string }} params
 * @returns {Promise<void>}
 */
export const sendEmailVerification = async ({ email, token }) => {
  const verificationUrl = buildUrl('/verify-email', token);
  logger.info({ message: 'Queued email verification', to: maskEmail(email) });
  const html = renderTemplate({
    title: `Confirm your email to unlock ${childProfile.jarName}`,
    previewText: `Finish setting up your ${childProfile.jarName} account.`,
    introLines: [
      `Welcome to the ${childProfile.name} family ritual!`,
      'Tap the button below within the next day to confirm your email address and start capturing gratitude together.',
    ],
    action: { label: 'Verify email', url: verificationUrl },
    footerLines: ['If you did not request this, you can safely ignore this email.'],
  });
  const text = renderText([
    `Welcome to the ${childProfile.name} family ritual! Verify your email to unlock ${childProfile.jarName}.`,
    verificationUrl,
    'If you did not request this, you can ignore this email.',
  ]);
  await deliverEmail({
    from: env.emailFrom,
    to: email,
    subject: `Verify your email for ${childProfile.jarName}`,
    text,
    html,
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
  const html = renderTemplate({
    title: `Reset your ${childProfile.jarName} password`,
    previewText: 'Use the secure link below to choose a new password.',
    introLines: [
      `Someone (hopefully you!) asked to reset the password for this ${childProfile.jarName} account.`,
      'Set a fresh password within the next hour by using the button below.',
    ],
    action: { label: 'Create a new password', url: resetUrl },
    footerLines: ['If you did not request a reset, you can ignore this email—your password will stay the same.'],
  });
  const text = renderText([
    `Use the following link to reset your ${childProfile.jarName} password:`,
    resetUrl,
    'If you did not request this change, you can ignore this email.',
  ]);
  await deliverEmail({
    from: env.emailFrom,
    to: email,
    subject: `Reset your password for ${childProfile.jarName}`,
    text,
    html,
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
  const html = renderTemplate({
    title: `Join ${familyName} on ${childProfile.jarName}`,
    previewText: `Accept your invitation to ${familyName}.`,
    introLines: [
      `${familyName} would love for you to join their gratitude circle on ${childProfile.jarName}.`,
      'Click the button below to accept and start sharing celebrations together.',
    ],
    action: { label: 'Accept invitation', url: inviteUrl },
    footerLines: ['This link will expire soon for security, so be sure to use it promptly.'],
  });
  const text = renderText([
    `${familyName} invited you to join ${childProfile.jarName}. Accept the invitation using the link below:`,
    inviteUrl,
  ]);
  await deliverEmail({
    from: env.emailFrom,
    to: email,
    subject: `You have been invited to ${familyName} on ${childProfile.jarName}`,
    text,
    html,
  });
};
