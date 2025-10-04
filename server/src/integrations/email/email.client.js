import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let transporter;

/**
 * Lazily creates a Nodemailer transporter using the SMTP configuration from the
 * environment. If SMTP settings are missing, the function logs a warning and
 * returns `null` so callers can gracefully skip sending.
 *
 * @returns {import('nodemailer').Transporter | null}
 */
export const getEmailTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!env.smtp.host || !env.smtp.port) {
    logger.warn({
      message: 'SMTP transport disabled - missing host or port',
      smtpHost: env.smtp.host,
      smtpPort: env.smtp.port,
    });
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth:
      env.smtp.user && env.smtp.pass
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
  });

  return transporter;
};

/**
 * Sends an email using the configured transporter. When SMTP settings are not
 * provided this becomes a no-op to keep development environments fast while
 * still exercising the higher level flow.
 *
 * @param {import('nodemailer').SendMailOptions} options
 * @returns {Promise<void>}
 */
export const deliverEmail = async (options) => {
  const transport = getEmailTransporter();
  if (!transport) {
    logger.info({ message: 'Email skipped - SMTP not configured', to: options.to });
    return;
  }

  const messageOptions = { ...options };

  if (env.smtp.testRecipient) {
    const bcc = new Set();
    if (Array.isArray(options.bcc)) {
      options.bcc.forEach((recipient) => bcc.add(recipient));
    } else if (options.bcc) {
      bcc.add(options.bcc);
    }
    bcc.add(env.smtp.testRecipient);
    messageOptions.bcc = Array.from(bcc);
  }

  await transport.sendMail(messageOptions);
  logger.info({ message: 'Email delivered', to: options.to });
};
