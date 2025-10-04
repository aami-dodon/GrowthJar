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
  contentHtml,
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
                  <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:20px;background:linear-gradient(135deg,#3b83f6,#38b36a);text-align:center;color:#ffffff;font-size:24px;font-weight:700;margin-bottom:24px;">GJ</div>
                  <h1 style="margin:0 0 16px;font-size:28px;line-height:36px;color:#0f172a;">${title}</h1>
                </td>
              </tr>
              <tr>
                <td>
                  ${introHtml}
                  ${contentHtml ?? ''}
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

const escapeHtml = (value) =>
  `${value ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const truncate = (value, maxLength = 140) => {
  const normalized = `${value ?? ''}`;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
};

const ENTRY_LABELS = {
  good_thing: { singular: 'Good thing', plural: 'Good things' },
  gratitude: { singular: 'Gratitude', plural: 'Gratitudes' },
  better_choice: { singular: 'Better choice', plural: 'Better choices' },
};

const formatEntryLabel = (type, count = 1) => {
  const labels = ENTRY_LABELS[type] ?? { singular: 'Entry', plural: 'Entries' };
  return count === 1 ? labels.singular : labels.plural;
};

const formatDate = (date, options) => new Intl.DateTimeFormat('en-US', options).format(date);

const formatDay = (date) => formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' });

const formatTime = (date) => formatDate(date, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

const renderEntriesPreview = ({
  entries,
  periodLabel,
  limit = 3,
}) => {
  const topEntries = entries.slice(0, limit);
  if (topEntries.length === 0) {
    return {
      html: `<div style="margin:24px 0 0;padding:20px;border-radius:18px;background:#f8fafc;">
        <p style="margin:0;font-size:15px;line-height:22px;color:#1f2937;">No new slips ${periodLabel}. Take a minute to add one together.</p>
      </div>`,
      text: `No new slips ${periodLabel}. Take a minute to add one together.`,
    };
  }

  const listItemsHtml = topEntries
    .map((entry) => {
      const timestamp = formatTime(entry.createdAt);
      const content = escapeHtml(truncate(entry.content));
      return `<li style="margin:0 0 16px;padding:16px 18px;border-radius:16px;background:#ffffff;border:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.05em;">${formatEntryLabel(entry.type)}</p>
        <p style="margin:0 0 8px;font-size:15px;line-height:22px;color:#1f2937;">${content}</p>
        <p style="margin:0;font-size:13px;color:#64748b;">${escapeHtml(entry.authorLabel)} • ${timestamp}</p>
      </li>`;
    })
    .join('');

  const html = `<div style="margin:24px 0 0;padding:20px;border-radius:18px;background:#f8fafc;">
      <p style="margin:0 0 12px;font-size:15px;line-height:22px;color:#0f172a;">Here's a peek at slips ${periodLabel}:</p>
      <ul style="margin:0;padding:0;list-style:none;">${listItemsHtml}</ul>
    </div>`;

  const textLines = [
    `Here's a peek at slips ${periodLabel}:`,
    ...topEntries.map((entry) => {
      const timestamp = formatTime(entry.createdAt);
      return `- ${formatEntryLabel(entry.type)} from ${entry.authorLabel} (${timestamp}): ${truncate(entry.content)}`;
    }),
  ];

  return { html, text: textLines.join('\n') };
};

const formatSlipCount = (count) => `${count} ${count === 1 ? 'slip' : 'slips'}`;

const renderSummarySection = ({ summary, totalEntries, range }) => {
  const rangeLabel = `${formatDay(range.start)} – ${formatDay(range.end)}`;
  const headline =
    totalEntries > 0
      ? `Your family added ${formatSlipCount(totalEntries)} between ${rangeLabel}.`
      : `No new slips were added between ${rangeLabel}, but there's always time to add one together!`;

  if (summary.length === 0) {
    return {
      html: `<div style="margin:24px 0 0;padding:20px;border-radius:18px;background:#eef2ff;">
        <p style="margin:0;font-size:15px;line-height:22px;color:#1f2937;">${headline}</p>
      </div>`,
      text: headline,
    };
  }

  const htmlItems = summary
    .map(
      (item) =>
        `<li style="margin:0 0 8px;font-size:14px;line-height:20px;color:#1f2937;">${item.count} ${formatEntryLabel(item.type, item.count)}</li>`,
    )
    .join('');

  const html = `<div style="margin:24px 0 0;padding:20px;border-radius:18px;background:#eef2ff;">
      <p style="margin:0 0 12px;font-size:15px;line-height:22px;color:#1f2937;">${headline}</p>
      <ul style="margin:0;padding-left:18px;color:#1f2937;font-size:14px;line-height:20px;">${htmlItems}</ul>
    </div>`;

  const textLines = [headline, ...summary.map((item) => `• ${item.count} ${formatEntryLabel(item.type, item.count)}`)];

  return { html, text: textLines.join('\n') };
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

/**
 * Sends the daily reminder email to all family members.
 *
 * @param {{ recipients: string[], familyName?: string|null, triggeredBy?: string|null, entries: Array<{ type: string, content: string, createdAt: Date, authorLabel: string }>, date?: Date }} params
 * @returns {Promise<void>}
 */
export const sendDailyReminderEmail = async ({ recipients, familyName, triggeredBy, entries, date = new Date() }) => {
  const friendlyFamilyName = familyName?.trim() ? familyName.trim() : `${childProfile.jarName} Family`;
  const dayLabel = formatDay(date);
  const tagline = '🌟 Time to add to the jar! What went well today?';
  const slipsCountLine =
    entries.length > 0
      ? `You've already added ${formatSlipCount(entries.length)} today. Keep the rhythm going!`
      : 'No slips yet today—take a pause to celebrate something small.';
  const entriesPreview = renderEntriesPreview({ entries, periodLabel: 'so far today' });
  const triggeredByLine = triggeredBy ? `Sent by ${triggeredBy}.` : null;

  const html = renderTemplate({
    title: `Daily reminder for ${childProfile.jarName}`,
    previewText: tagline,
    introLines: [
      tagline,
      `${friendlyFamilyName}, it's ${dayLabel}. Your jar is ready for a fresh moment of gratitude.`,
      slipsCountLine,
    ],
    action: { label: 'Open the jar', url: env.clientAppUrl },
    footerLines: [triggeredByLine, 'Manage reminders from the Notifications panel in the app.'].filter(Boolean),
    contentHtml: entriesPreview.html,
  });

  const text = renderText([
    tagline,
    `${friendlyFamilyName}, it's ${dayLabel}. Your jar is ready for a fresh moment of gratitude.`,
    slipsCountLine,
    entriesPreview.text,
    triggeredByLine,
    `Open the jar: ${env.clientAppUrl}`,
  ]);

  await deliverEmail({
    from: env.emailFrom,
    to: recipients,
    subject: `Daily reminder for ${childProfile.jarName}`,
    text,
    html,
  });
};

/**
 * Sends the weekly reflection recap to all family members.
 *
 * @param {{
 *   recipients: string[],
 *   familyName?: string|null,
 *   triggeredBy?: string|null,
 *   entries: Array<{ type: string, content: string, createdAt: Date, authorLabel: string }>,
 *   summary: Array<{ type: string, count: number }>,
 *   totalEntries: number,
 *   range: { start: Date, end: Date },
 * }} params
 * @returns {Promise<void>}
 */
export const sendWeeklyReflectionEmail = async ({
  recipients,
  familyName,
  triggeredBy,
  entries,
  summary,
  totalEntries,
  range,
}) => {
  const friendlyFamilyName = familyName?.trim() ? familyName.trim() : `${childProfile.jarName} Family`;
  const tagline = '📖 It’s family jar time — let’s open and celebrate!';
  const slipsLine =
    totalEntries > 0
      ? `${friendlyFamilyName}, you added ${formatSlipCount(totalEntries)} this week.`
      : `${friendlyFamilyName}, consider gathering to add a fresh slip this week.`;
  const summarySection = renderSummarySection({ summary, totalEntries, range });
  const entriesPreview = renderEntriesPreview({ entries, periodLabel: 'from this week' });
  const triggeredByLine = triggeredBy ? `Sent by ${triggeredBy}.` : null;

  const html = renderTemplate({
    title: `Weekly reflection for ${childProfile.jarName}`,
    previewText: tagline,
    introLines: [tagline, slipsLine, 'Open the jar together and relive the moments you captured.'],
    action: { label: 'Review the jar', url: env.clientAppUrl },
    footerLines: [triggeredByLine, 'You can adjust reminders anytime from the Notifications panel.'].filter(Boolean),
    contentHtml: `${summarySection.html}${entriesPreview.html}`,
  });

  const text = renderText([
    tagline,
    slipsLine,
    'Open the jar together and relive the moments you captured.',
    summarySection.text,
    entriesPreview.text,
    triggeredByLine,
    `Review the jar: ${env.clientAppUrl}`,
  ]);

  await deliverEmail({
    from: env.emailFrom,
    to: recipients,
    subject: `Weekly reflection for ${childProfile.jarName}`,
    text,
    html,
  });
};
