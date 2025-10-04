import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../..');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

loadEnv({ path: path.join(rootDir, envFile) });

const requiredVariables = [
  'DATABASE_URL',
  'JWT_SECRET',
  'AUTH_MOM_EMAIL',
  'AUTH_DAD_EMAIL',
  'AUTH_RISHI_EMAIL',
];

requiredVariables.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const parseOrigins = (origins) => {
  if (!origins) return [];
  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  emailFrom:
    process.env.EMAIL_FROM ??
    process.env.EMAIL_SMTP_FROM ??
    'no-reply@rishisjar.com',
  systemAccessToken: process.env.SYSTEM_ACCESS_TOKEN ?? null,
  resetTokenExpiresMinutes: process.env.RESET_TOKEN_EXPIRES_MINUTES
    ? Number(process.env.RESET_TOKEN_EXPIRES_MINUTES)
    : 60,
  verificationTokenExpiresMinutes: process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES
    ? Number(process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES)
    : 60 * 24,
  clientAppUrl: process.env.CLIENT_APP_URL ?? 'http://localhost:5173',
  smtp: {
    host: process.env.EMAIL_SMTP_HOST ?? null,
    port: process.env.EMAIL_SMTP_PORT
      ? Number(process.env.EMAIL_SMTP_PORT)
      : null,
    user: process.env.EMAIL_SMTP_USER ?? null,
    pass: process.env.EMAIL_SMTP_PASS ?? null,
    from:
      process.env.EMAIL_SMTP_FROM ??
      process.env.EMAIL_FROM ??
      'no-reply@rishisjar.com',
    testRecipient: process.env.EMAIL_SMTP_TEST_RECIPIENT ?? null,
  },
  notificationSchedules: {
    dailyCron: process.env.NOTIFICATION_DAILY_CRON ?? null,
    weeklyCron: process.env.NOTIFICATION_WEEKLY_CRON ?? null,
  },
  allowedFamilyEmails: {
    mom: process.env.AUTH_MOM_EMAIL,
    dad: process.env.AUTH_DAD_EMAIL,
    rishi: process.env.AUTH_RISHI_EMAIL,
  },
};
