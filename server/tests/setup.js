import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.SYSTEM_ACCESS_TOKEN = process.env.SYSTEM_ACCESS_TOKEN ?? 'system-token';
process.env.CORS_ORIGINS = '';
process.env.EMAIL_FROM = 'no-reply@test.com';
process.env.AUTH_MOM_EMAIL = process.env.AUTH_MOM_EMAIL ?? 'mom@example.com';
process.env.AUTH_DAD_EMAIL = process.env.AUTH_DAD_EMAIL ?? 'dad@example.com';
process.env.AUTH_RISHI_EMAIL = process.env.AUTH_RISHI_EMAIL ?? 'rishi@example.com';

jest.setTimeout(15000);
