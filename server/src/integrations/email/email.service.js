// --- Imports
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { childProfile } from '../../shared/constants/childProfile.js';
import { deliverEmail } from './email.client.js';

// --- Helpers
/**
 * Obscures an email address for safe logging by keeping only the first two
 * characters of the local part.
 *
 * @param {string | null | undefined} email - Email address to mask.
 * @returns {string} Masked email string suitable for logs.
 */
const maskEmail = (email) => {
  const [local, domain] = (email ?? '').split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
};

/**
 * Builds a URL pointing at the client application with an appended token
 * parameter. Falls back to simple string concatenation when the environment
 * value is not a valid absolute URL.
 *
 * @param {string} pathname - Target pathname within the client app.
 * @param {string} token - Token that should be appended as a query parameter.
 * @returns {string} Fully qualified URL string.
 */
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
 * Builds a URL pointing at the client application without appending additional
 * parameters. Used for simple navigation links in emails.
 *
 * @param {string} pathname - Target pathname within the client application.
 * @returns {string} Fully qualified URL string.
 */
const buildClientUrl = (pathname) => {
  try {
    const url = new URL(env.clientAppUrl);
    url.pathname = pathname;
    return url.toString();
  } catch (error) {
    logger.warn({
      message: 'Unable to build URL from clientAppUrl',
      clientAppUrl: env.clientAppUrl,
      error,
    });
    return `${env.clientAppUrl.replace(/\/$/, '')}${pathname}`;
  }
};

/**
 * Converts structured pieces of an email into a styled HTML document.
 *
 * @param {object} params - Template configuration.
 * @param {string} params.title - Title used for the document and heading.
 * @param {string} [params.previewText] - Hidden preview copy for inbox clients.
 * @param {string[]} [params.introLines] - Opening paragraphs rendered at the top.
 * @param {{ label: string, url: string } | null} [params.action] - Primary call to action button.
 * @param {string[]} [params.footerLines] - Closing paragraphs rendered near the footer.
 * @param {string} [params.contentHtml] - Additional HTML body content inserted between intro and footer.
 * @returns {string} Rendered HTML document string.
 */
const renderTemplate = ({
  title,
  previewText,
  introLines,
  action,
  footerLines,
  contentHtml,
}) => {
  const introHtml = (introLines ?? [])
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#1f2937;">${escapeHtml(line)}</p>`)
    .join('');

  const footerHtml = (footerLines ?? [])
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 8px;font-size:14px;line-height:20px;color:#4b5563;">${escapeHtml(line)}</p>`)
    .join('');

  const buttonHtml = action
    ? `<a href="${escapeHtml(action.url)}" style="display:inline-block;padding:14px 32px;border-radius:9999px;background:#3b83f6;color:#ffffff;font-weight:600;text-decoration:none;">${escapeHtml(action.label)}</a>`
    : '';

  const linkHtml = action
    ? `<p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#6b7280;word-break:break-word;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${escapeHtml(action.url)}" style="color:#3b83f6;text-decoration:underline;">${escapeHtml(action.url)}</a></p>`
    : '';

  const preview = previewText ? escapeHtml(previewText) : '';
  const contentSection = contentHtml ?? '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title ?? childProfile.jarName)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preview}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 35px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:40px 32px 32px;">
                <h1 style="margin:0 0 24px;font-size:24px;line-height:32px;color:#111827;">${escapeHtml(title ?? childProfile.jarName)}</h1>
                ${introHtml}
                ${contentSection}
                ${buttonHtml ? `<div style="margin:32px 0 0;text-align:center;">${buttonHtml}</div>` : ''}
                ${linkHtml}
                <div style="margin:32px 0 0;border-top:1px solid #e5e7eb;padding-top:24px;">${footerHtml}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

/**
 * Converts an array of lines into a plain text email body separated by blank
 * lines to improve readability in terminal-based clients.
 *
 * @param {Array<string | null | undefined>} lines - Lines to include in the body.
 * @returns {string} Plain text representation.
 */
const renderText = (lines) => lines.filter(Boolean).join('\n\n');

// --- Escape helper (merged safely)
/**
 * Escapes HTML significant characters to prevent unwanted markup execution.
 *
 * @param {unknown} value - Arbitrary value to escape.
 * @returns {string} HTML-safe string.
 */
const escapeHtml = (value) => {
  if (typeof value !== 'string') {
    value = `${value ?? ''}`;
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// --- Truncate + labels for summaries
/**
 * Truncates a string to a safe preview length while maintaining word
 * boundaries.
 *
 * @param {unknown} value - Text to truncate.
 * @param {number} [maxLength=140] - Maximum characters to include.
 * @returns {string} Truncated string with an ellipsis when necessary.
 */
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

/**
 * Resolves a human friendly label for an entry type.
 *
 * @param {string} type - Entry type identifier.
 * @param {number} [count=1] - Quantity used to determine pluralization.
 * @returns {string} A label describing the entry/entries.
 */
const formatEntryLabel = (type, count = 1) => {
  const labels = ENTRY_LABELS[type] ?? { singular: 'Entry', plural: 'Entries' };
  return count === 1 ? labels.singular : labels.plural;
};

/**
 * Formats a date with configurable options using the `en-US` locale.
 *
 * @param {Date} date - Date instance to format.
 * @param {Intl.DateTimeFormatOptions} options - Date formatting options.
 * @returns {string} Formatted date string.
 */
const formatDate = (date, options) => new Intl.DateTimeFormat('en-US', options).format(date);

/**
 * Formats a date into a short day representation.
 *
 * @param {Date} date - Date instance to format.
 * @returns {string} Human friendly day string.
 */
const formatDay = (date) => formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' });

/**
 * Formats a date into a localized time string.
 *
 * @param {Date} date - Date instance to format.
 * @returns {string} Localized time string.
 */
const formatTime = (date) => formatDate(date, { hour: 'numeric', minute: '2-digit' });

/**
 * Renders a preview list for recent jar entries used in reminder emails.
 *
 * @param {object} params - Rendering configuration.
 * @param {Array<{ type: string, content: string, createdAt: Date, authorLabel?: string }>} params.entries - Entries to display.
 * @param {string} params.periodLabel - Heading describing the time period.
 * @param {number} [params.limit=3] - Maximum number of entries to include.
 * @returns {{ html: string, text: string }} Object containing HTML and text representations.
 */
const renderEntriesPreview = ({ entries, periodLabel, limit = 3 }) => {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 3;
  const selection = safeEntries.slice(0, safeLimit);

  if (selection.length === 0) {
    const heading = periodLabel ?? 'Recent entries';
    return {
      html: `<p style="margin:24px 0 0;font-size:16px;line-height:24px;color:#1f2937;">No entries yet for ${escapeHtml(
        heading.toLowerCase(),
      )}. Take a moment to add one today.</p>`,
      text: `No entries yet for ${heading}.`,
    };
  }

  const itemsHtml = selection
    .map((entry) => {
      const createdAt = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt ?? Date.now());
      const label = formatEntryLabel(entry.type);
      const author = entry.authorLabel ? escapeHtml(entry.authorLabel) : 'A family member';
      const timestamp = `${formatDay(createdAt)} • ${formatTime(createdAt)}`;
      return `<tr>
        <td style="padding:16px 0;border-bottom:1px solid #e5e7eb;">
          <div style="font-size:15px;line-height:22px;color:#111827;font-weight:600;">${author}</div>
          <div style="font-size:13px;line-height:20px;color:#6b7280;margin-top:4px;">${escapeHtml(timestamp)}</div>
          <div style="font-size:16px;line-height:24px;color:#1f2937;margin-top:12px;">${escapeHtml(truncate(entry.content, 280))}</div>
          <div style="font-size:13px;line-height:20px;color:#3b83f6;margin-top:12px;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(label)}</div>
        </td>
      </tr>`;
    })
    .join('');

  const remaining = safeEntries.length - selection.length;
  const heading = periodLabel ?? 'Recent entries';

  const html = `<div style="margin:24px 0 0;">
    <h2 style="margin:0 0 16px;font-size:18px;line-height:28px;color:#111827;">${escapeHtml(heading)}</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
    ${
      remaining > 0
        ? `<p style=\"margin:16px 0 0;font-size:14px;line-height:20px;color:#6b7280;\">+ ${remaining} more entr${
            remaining === 1 ? 'y' : 'ies'
          } waiting in the jar.</p>`
        : ''
    }
  </div>`;

  const textLines = selection.map((entry) => {
    const createdAt = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt ?? Date.now());
    const author = entry.authorLabel ?? 'A family member';
    const label = formatEntryLabel(entry.type);
    return `${author} — ${label}\n${formatDay(createdAt)} ${formatTime(createdAt)}\n${truncate(entry.content, 200)}`;
  });

  if (remaining > 0) {
    textLines.push(`+ ${remaining} more entr${remaining === 1 ? 'y' : 'ies'} in the jar`);
  }

  return {
    html,
    text: renderText([heading, ...textLines]),
  };
};

/**
 * Renders a summary section describing entry counts within a range.
 *
 * @param {object} params - Rendering configuration.
 * @param {Array<{ type: string, count: number }>} params.summary - Aggregated counts for each entry type.
 * @param {number} params.totalEntries - Total entries considered in the summary.
 * @param {{ start: Date, end: Date } | null} params.range - Optional date range represented in the summary.
 * @returns {{ html: string, text: string }} Object containing HTML and text representations.
 */
const renderSummarySection = ({ summary, totalEntries, range }) => {
  const items = Array.isArray(summary) ? summary.filter((item) => item && item.count > 0) : [];
  const hasContent = items.length > 0 || (typeof totalEntries === 'number' && totalEntries > 0);

  if (!hasContent) {
    return { html: '', text: '' };
  }

  const rangeLabel = range?.start && range?.end ? `${formatDay(range.start)} – ${formatDay(range.end)}` : null;

  const itemsHtml = items
    .map((item) => {
      const label = formatEntryLabel(item.type, item.count);
      return `<li style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #e5e7eb;">
        <span style="font-size:15px;line-height:22px;color:#1f2937;">${escapeHtml(label)}</span>
        <span style="font-size:15px;line-height:22px;color:#111827;font-weight:600;">${escapeHtml(`${item.count}`)}</span>
      </li>`;
    })
    .join('');

  const html = `<div style="margin:32px 0 0;">
    <h2 style="margin:0 0 16px;font-size:18px;line-height:28px;color:#111827;">${escapeHtml(
      rangeLabel ? `Weekly summary (${rangeLabel})` : 'Weekly summary',
    )}</h2>
    <ul style="list-style:none;padding:0;margin:0;">${itemsHtml}</ul>
    <p style="margin:20px 0 0;font-size:14px;line-height:20px;color:#6b7280;">Total entries: ${escapeHtml(
      `${totalEntries ?? items.reduce((sum, item) => sum + item.count, 0)}`,
    )}</p>
  </div>`;

  const textLines = items.map((item) => {
    const label = formatEntryLabel(item.type, item.count);
    if (item.type === 'better_choice') {
      return `${formatSlipCount(item.count)} celebrated as better choices.`;
    }
    return `${item.count} ${label.toLowerCase()}`;
  });

  const summaryLines = [
    rangeLabel ? `Summary for ${rangeLabel}` : 'Weekly summary',
    ...textLines,
    `Total entries: ${totalEntries ?? items.reduce((sum, item) => sum + item.count, 0)}`,
  ];

  return { html, text: renderText(summaryLines) };
};

/**
 * Formats a count of slips (better choice moments) for messaging.
 *
 * @param {number} count - Number of slips recorded.
 * @returns {string} Human friendly slip label.
 */
const formatSlipCount = (count) => `${count} ${count === 1 ? 'slip' : 'slips'}`;

// --- Core email senders (keep all three existing ones: verify, reset, invite)
/**
 * Sends an email verification message containing a tokenized link.
 *
 * @param {{ email: string, token: string }} params - Verification payload.
 * @returns {Promise<void>}
 */
export const sendEmailVerification = async ({ email, token }) => {
  const verifyUrl = buildUrl('/verify-email', token);
  const introLines = [
    `Welcome to ${childProfile.jarName}!`,
    'Please confirm your email address to start sharing reflections with your family.',
  ];

  const html = renderTemplate({
    title: `Verify your email for ${childProfile.jarName}`,
    previewText: 'Confirm your email address to finish setting up your account.',
    introLines,
    action: { label: 'Verify email', url: verifyUrl },
    footerLines: [
      'If you did not create this account you can safely ignore this message.',
      `Sent from ${childProfile.jarName}.`,
    ],
  });

  const text = renderText([
    `Verify your email for ${childProfile.jarName}`,
    ...introLines,
    `Verification link: ${verifyUrl}`,
    'If you did not request this, ignore this email.',
  ]);

  await deliverEmail({
    to: email,
    from: env.emailFrom,
    subject: `Verify your email for ${childProfile.jarName}`,
    html,
    text,
  });

  logger.info({
    message: 'Email verification sent',
    to: maskEmail(email),
  });
};

/**
 * Sends a password reset email containing a tokenized link.
 *
 * @param {{ email: string, token: string }} params - Password reset payload.
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async ({ email, token }) => {
  const resetUrl = buildUrl('/reset-password', token);
  const introLines = [
    'A password reset was requested for your account.',
    'Use the button below to choose a new password. This link expires soon for your security.',
  ];

  const html = renderTemplate({
    title: `Reset your password for ${childProfile.jarName}`,
    previewText: 'Choose a new password to get back into your gratitude jar.',
    introLines,
    action: { label: 'Reset password', url: resetUrl },
    footerLines: ['If you did not request a reset you can ignore this email.'],
  });

  const text = renderText([
    `Reset your password for ${childProfile.jarName}`,
    ...introLines,
    `Reset link: ${resetUrl}`,
    'If you did not request this change, you can ignore this email.',
  ]);

  await deliverEmail({
    to: email,
    from: env.emailFrom,
    subject: `Reset your password for ${childProfile.jarName}`,
    html,
    text,
  });

  logger.info({
    message: 'Password reset email sent',
    to: maskEmail(email),
  });
};

/**
 * Sends a family invitation email allowing new members to join the jar.
 *
 * @param {{ email: string, token: string, familyName: string }} params - Invitation payload.
 * @returns {Promise<void>}
 */
export const sendFamilyInviteEmail = async ({ email, token, familyName }) => {
  const inviteUrl = buildUrl('/accept-invite', token);
  const introLines = [
    `You've been invited to join the ${familyName} family on ${childProfile.jarName}.`,
    'Tap the button below to accept the invitation and finish setting up your account.',
  ];

  const html = renderTemplate({
    title: `Join the ${familyName} family on ${childProfile.jarName}`,
    previewText: 'Accept your invitation to join the family gratitude jar.',
    introLines,
    action: { label: 'Accept invitation', url: inviteUrl },
    footerLines: ['This invitation link will expire for security reasons.'],
  });

  const text = renderText([
    `Join the ${familyName} family on ${childProfile.jarName}`,
    ...introLines,
    `Accept invitation: ${inviteUrl}`,
  ]);

  await deliverEmail({
    to: email,
    from: env.emailFrom,
    subject: `You're invited to ${childProfile.jarName}`,
    html,
    text,
  });

  logger.info({
    message: 'Family invitation email sent',
    to: maskEmail(email),
  });
};

// --- Daily / Weekly reminders (from review-notification branch)
/**
 * Sends a daily reminder email summarizing the day's entries.
 *
 * @param {{ recipients: string[] | string, familyName: string, triggeredBy?: string | null, entries: Array<object>, date: Date }} params - Reminder payload.
 * @returns {Promise<void>}
 */
export const sendDailyReminderEmail = async ({ recipients, familyName, triggeredBy, entries, date }) => {
  const list = Array.isArray(recipients) ? recipients.filter(Boolean) : [recipients].filter(Boolean);
  if (list.length === 0) {
    logger.warn({ message: 'No recipients provided for daily reminder email' });
    return;
  }

  const reflectionDate = date instanceof Date ? date : new Date(date ?? Date.now());
  const heading = `${formatDay(reflectionDate)} reflections`;
  const preview = `Today's moments from ${familyName}`;
  const entriesSection = renderEntriesPreview({
    entries,
    periodLabel: `Today in ${childProfile.jarName}`,
    limit: 5,
  });

  const introLines = [
    triggeredBy
      ? `${triggeredBy} nudged the family to reflect together today.`
      : `Here's your reminder to pause and add to ${childProfile.jarName}.`,
    entries?.length
      ? 'Take a look at what was added so far and consider sharing something new.'
      : 'No entries yet—be the first to add a reflection today!',
  ];

  const actionUrl = buildClientUrl('/app');

  const html = renderTemplate({
    title: heading,
    previewText: preview,
    introLines,
    contentHtml: entriesSection.html,
    action: { label: 'Open the jar', url: actionUrl },
    footerLines: [
      triggeredBy ? `Reminder sent by ${triggeredBy}.` : null,
      'You are receiving this email because you subscribed to daily reminders.',
    ],
  });

  const text = renderText([
    heading,
    entriesSection.text,
    triggeredBy ? `Reminder sent by: ${triggeredBy}` : null,
    `Open the jar: ${actionUrl}`,
  ]);

  await deliverEmail({
    to: list[0],
    bcc: list.slice(1),
    from: env.emailFrom,
    subject: `${familyName} • Daily reflection`,
    html,
    text,
  });

  logger.info({
    message: 'Daily reminder email sent',
    recipients: list.map(maskEmail),
    entryCount: entries?.length ?? 0,
  });
};

/**
 * Sends a weekly reflection email containing highlights and summary counts.
 *
 * @param {{ recipients: string[] | string, familyName: string, triggeredBy?: string | null, entries: Array<object>, summary: Array<object>, totalEntries: number, range: { start: Date, end: Date } }} params - Weekly summary payload.
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
  const list = Array.isArray(recipients) ? recipients.filter(Boolean) : [recipients].filter(Boolean);
  if (list.length === 0) {
    logger.warn({ message: 'No recipients provided for weekly reflection email' });
    return;
  }

  const entriesSection = renderEntriesPreview({
    entries,
    periodLabel: 'This week in the jar',
    limit: 5,
  });
  const summarySection = renderSummarySection({ summary, totalEntries, range });
  const total = typeof totalEntries === 'number' ? totalEntries : entries?.length ?? 0;

  const introLines = [
    triggeredBy
      ? `${triggeredBy} kicked off the weekly reflection.`
      : `Here's your weekly reflection for ${childProfile.jarName}.`,
    total
      ? `You captured ${total} meaningful moment${total === 1 ? '' : 's'} this week. Take a look at a few highlights below.`
      : 'No entries were captured this week—consider planning a family reflection moment!',
  ];

  const actionUrl = buildClientUrl('/app');
  const previewText = total
    ? `${total} new moment${total === 1 ? '' : 's'} from the ${familyName} family.`
    : `Catch up on the ${familyName} family jar.`;

  const html = renderTemplate({
    title: `${familyName} • Weekly reflection`,
    previewText,
    introLines,
    contentHtml: `${entriesSection.html}${summarySection.html}`,
    action: { label: 'Review the jar', url: actionUrl },
    footerLines: [
      triggeredBy ? `Reflection prompted by ${triggeredBy}.` : null,
      'You are receiving this email because you subscribed to weekly reflections.',
    ],
  });

  const text = renderText([
    `${familyName} • Weekly reflection`,
    entriesSection.text,
    summarySection.text,
    triggeredBy ? `Reflection prompted by: ${triggeredBy}` : null,
    `Review the jar: ${actionUrl}`,
  ]);

  await deliverEmail({
    to: list[0],
    bcc: list.slice(1),
    from: env.emailFrom,
    subject: `${familyName} • Weekly reflection`,
    html,
    text,
  });

  logger.info({
    message: 'Weekly reflection email sent',
    recipients: list.map(maskEmail),
    entryCount: entries?.length ?? 0,
    totalEntries: total,
  });
};

// --- Entry notification (from main branch)
const entryTypeCopy = {
  good_thing: { label: 'Good Thing', emoji: '🌟' },
  gratitude: { label: 'Gratitude', emoji: '💌' },
  better_choice: { label: 'Better Choice Reflection', emoji: '🧠' },
};

/**
 * Sends a notification email when a new jar entry is created.
 *
 * @param {{ to: string, entryType: string, content: string, authorName?: string, recipientName?: string }} params - Entry notification payload.
 * @returns {Promise<void>}
 */
export const sendEntryNotificationEmail = async ({ to, entryType, content, authorName, recipientName }) => {
  if (!to) {
    logger.warn({ message: 'Missing recipient for entry notification email' });
    return;
  }

  const copy = entryTypeCopy[entryType] ?? { label: 'Jar Entry', emoji: '📝' };
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,';
  const author = authorName ?? 'A family member';
  const actionUrl = buildClientUrl('/app');

  const introLines = [
    greeting,
    `${author} just added a new ${copy.label.toLowerCase()} to ${childProfile.jarName}.`,
  ];

  const html = renderTemplate({
    title: `${copy.emoji} New ${copy.label} from ${author}`,
    previewText: `${author} added a new ${copy.label.toLowerCase()} to the jar.`,
    introLines,
    contentHtml: `<div style="margin:12px 0 0;padding:20px;border-radius:16px;background:#f8fafc;font-size:16px;line-height:24px;color:#1f2937;">${escapeHtml(
      content ?? '',
    )}</div>`,
    action: { label: 'Read it in the jar', url: actionUrl },
    footerLines: ['You receive these alerts because you are part of the family jar.'],
  });

  const text = renderText([
    greeting,
    `${author} just added a new ${copy.label.toLowerCase()} to ${childProfile.jarName}.`,
    `Entry:\n${content ?? ''}`.trim(),
    `Read it in the jar: ${actionUrl}`,
  ]);

  await deliverEmail({
    to,
    from: env.emailFrom,
    subject: `${copy.emoji} New ${copy.label} in ${childProfile.jarName}`,
    html,
    text,
  });

  logger.info({
    message: 'Entry notification email sent',
    to: maskEmail(to),
    entryType,
  });
};
