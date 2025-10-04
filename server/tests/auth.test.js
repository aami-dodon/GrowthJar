import request from 'supertest';
import { jest } from '@jest/globals';
import crypto from 'node:crypto';

const emailMocks = {
  sendEmailVerification: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendFamilyInviteEmail: jest.fn().mockResolvedValue(undefined),
};

jest.unstable_mockModule('../src/integrations/email/email.service.js', () => emailMocks);

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  emailVerificationToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
  passwordResetToken: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
};

jest.unstable_mockModule('../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { createApp } = await import('../src/app.js');
await import('../src/config/prisma.js');

const app = createApp();

describe('Auth routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockImplementation(async ({ where }) => {
      if (where?.email) {
        return null;
      }
      if (where?.familyRole) {
        return null;
      }
      return null;
    });
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      ...data,
      id: 'user-1',
      emailVerified: false,
    }));
    prismaMock.user.update.mockImplementation(async ({ data, where }) => ({
      id: where.id,
      ...data,
    }));
    prismaMock.emailVerificationToken.create.mockResolvedValue({ id: 'token-1' });
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(null);
    prismaMock.emailVerificationToken.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);
    prismaMock.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.auditLog.create.mockResolvedValue({ id: 'audit-1' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user on signup', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      email: process.env.AUTH_MOM_EMAIL,
      password: 'Password123',
      role: 'parent',
      familyRole: 'mom',
      firstName: 'Parent',
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.email).toBe(process.env.AUTH_MOM_EMAIL);
    expect(response.body.data.familyRole).toBe('mom');
  });

  it('verifies an email via the public link', async () => {
    const token = 'valid-token-12345';
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60_000);

    prismaMock.emailVerificationToken.findFirst.mockImplementation(async ({ where }) => {
      if (where?.tokenHash === hashed) {
        return { id: 'evt-1', tokenHash: hashed, userId: 'user-1', expiresAt };
      }
      return null;
    });

    const response = await request(app).get('/verify-email').query({ token });

    expect(response.status).toBe(200);
    expect(response.text).toContain('Email verified');
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { emailVerified: true },
    });
    expect(prismaMock.emailVerificationToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });

  it('shows an error page when the token is missing', async () => {
    const response = await request(app).get('/verify-email');

    expect(response.status).toBe(400);
    expect(response.text).toContain('Verification link is invalid');
  });
});
