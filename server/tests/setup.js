import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.SYSTEM_ACCESS_TOKEN = process.env.SYSTEM_ACCESS_TOKEN ?? 'system-token';
process.env.CORS_ORIGINS = '';
process.env.EMAIL_FROM = 'no-reply@test.com';

jest.setTimeout(15000);
