// --- Imports
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { childProfile } from '../../shared/constants/childProfile.js';
import { deliverEmail } from './email.client.js';

// --- Helpers
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
  <html lang="en"> ... same template code ... </html>`;
};

const renderText = (lines) => lines.filter(Boolean).join('\n\n');

// --- Escape helper (merged safely)
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

const renderEntriesPreview = ({ entries, periodLabel, limit = 3 }) => { ... };
const renderSummarySection = ({ summary, totalEntries, range }) => { ... };
const formatSlipCount = (count) => `${count} ${count === 1 ? 'slip' : 'slips'}`;

// --- Core email senders (keep all three existing ones: verify, reset, invite)
export const sendEmailVerification = async (...) => { ... };
export const sendPasswordResetEmail = async (...) => { ... };
export const sendFamilyInviteEmail = async (...) => { ... };

// --- Daily / Weekly reminders (from review-notification branch)
export const sendDailyReminderEmail = async (...) => { ... };
export const sendWeeklyReflectionEmail = async (...) => { ... };

// --- Entry notification (from main branch)
const entryTypeCopy = {
  good_thing: { label: 'Good Thing', emoji: '🌟' },
  gratitude: { label: 'Gratitude', emoji: '💌' },
  better_choice: { label: 'Better Choice Reflection', emoji: '🧠' },
};

export const sendEntryNotificationEmail = async ({ to, entryType, content, authorName, recipientName }) => {
  const copy = entryTypeCopy[entryType] ?? { label: 'Jar Entry', emoji: '📝' };
  ...
};
