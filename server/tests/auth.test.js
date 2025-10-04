import request from 'supertest';
import { jest } from '@jest/globals';

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
  },
  emailVerificationToken: {
    create: jest.fn(),
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
    prismaMock.emailVerificationToken.create.mockResolvedValue({ id: 'token-1' });
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
});
