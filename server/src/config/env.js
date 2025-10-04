import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../..');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

loadEnv({ path: path.join(rootDir, envFile) });

const requiredVariables = ['DATABASE_URL', 'JWT_SECRET'];

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
  emailFrom: process.env.EMAIL_FROM ?? 'no-reply@rishisjar.com',
  systemAccessToken: process.env.SYSTEM_ACCESS_TOKEN ?? null,
  resetTokenExpiresMinutes: process.env.RESET_TOKEN_EXPIRES_MINUTES
    ? Number(process.env.RESET_TOKEN_EXPIRES_MINUTES)
    : 60,
  verificationTokenExpiresMinutes: process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES
    ? Number(process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES)
    : 60 * 24,
};
