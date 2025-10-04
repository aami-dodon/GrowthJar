import request from 'supertest';
import { jest } from '@jest/globals';

const emailMocks = {
  sendEmailVerification: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendFamilyInviteEmail: jest.fn().mockResolvedValue(undefined),
  sendDailyReminderEmail: jest.fn().mockResolvedValue(undefined),
  sendWeeklyReflectionEmail: jest.fn().mockResolvedValue(undefined),
};

jest.unstable_mockModule('../src/integrations/email/email.service.js', () => emailMocks);

const prismaMock = {
  user: { findUnique: jest.fn() },
  family: { findUnique: jest.fn() },
  jarEntry: { findMany: jest.fn() },
  notification: { create: jest.fn() },
  auditLog: { create: jest.fn() },
};

jest.unstable_mockModule('../src/config/prisma.js', () => ({ prisma: prismaMock }));

const auditMocks = { recordAuditLog: jest.fn().mockResolvedValue(undefined) };

jest.unstable_mockModule('../src/modules/audit/audit.service.js', () => auditMocks);

jest.unstable_mockModule('../src/middlewares/authMiddleware.js', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 'user-1', role: 'parent' };
    next();
  },
}));

const { createApp } = await import('../src/app.js');
await import('../src/config/prisma.js');

const app = createApp();

const FAMILY_ID = '11111111-1111-1111-1111-111111111111';

describe('Notification email flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.user.findUnique.mockImplementation(async ({ where }) => {
      if (where?.id === 'user-1') {
        return {
          id: 'user-1',
          familyId: FAMILY_ID,
          firstName: 'Avery',
          lastName: 'Parent',
          familyRole: 'mom',
          role: 'parent',
        };
      }
      return null;
    });

    prismaMock.family.findUnique.mockResolvedValue({
      id: FAMILY_ID,
      familyName: 'Sunshine Crew',
      members: [
        {
          id: 'user-1',
          email: 'mom@example.com',
          firstName: 'Avery',
          lastName: 'Parent',
          familyRole: 'mom',
        },
        {
          id: 'user-2',
          email: 'dad@example.com',
          firstName: 'Jordan',
          lastName: 'Parent',
          familyRole: 'dad',
        },
      ],
    });

    prismaMock.notification.create.mockImplementation(async ({ data }) => ({
      id: 'notif-1',
      ...data,
    }));

    prismaMock.auditLog.create.mockResolvedValue({ id: 'audit-1' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends a daily reminder email with the latest entries', async () => {
    const createdAt = new Date('2024-05-07T10:00:00.000Z');
    prismaMock.jarEntry.findMany.mockResolvedValueOnce([
      {
        id: 'entry-1',
        familyId: FAMILY_ID,
        userId: 'user-1',
        entryType: 'gratitude',
        content: 'Thanks for helping with homework!',
        metadata: { author: 'mom' },
        createdAt,
      },
    ]);

    const response = await request(app)
      .post('/api/notifications/send')
      .send({ familyId: FAMILY_ID, type: 'daily' });

    expect(response.status).toBe(201);
    expect(emailMocks.sendDailyReminderEmail).toHaveBeenCalledTimes(1);
    expect(emailMocks.sendDailyReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: ['mom@example.com', 'dad@example.com'],
        familyName: 'Sunshine Crew',
        entries: expect.arrayContaining([
          expect.objectContaining({
            type: 'gratitude',
            authorLabel: 'Mom',
            content: 'Thanks for helping with homework!',
            createdAt,
          }),
        ]),
      }),
    );
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ familyId: FAMILY_ID, type: 'daily' }),
      }),
    );
    expect(auditMocks.recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        details: expect.objectContaining({ type: 'daily', recipients: 2 }),
      }),
    );
  });

  it('sends a weekly reflection email with summary data', async () => {
    const weekEntries = [
      {
        id: 'entry-1',
        familyId: FAMILY_ID,
        userId: 'user-2',
        entryType: 'good_thing',
        content: 'Bike ride at the park',
        metadata: { author: 'dad' },
        createdAt: new Date('2024-05-04T17:00:00.000Z'),
      },
      {
        id: 'entry-2',
        familyId: FAMILY_ID,
        userId: 'user-1',
        entryType: 'gratitude',
        content: 'Loved our pizza night',
        metadata: { author: 'mom' },
        createdAt: new Date('2024-05-05T19:30:00.000Z'),
      },
      {
        id: 'entry-3',
        familyId: FAMILY_ID,
        userId: 'user-1',
        entryType: 'gratitude',
        content: 'Thanks for reading with me',
        metadata: { author: 'child' },
        createdAt: new Date('2024-05-06T20:15:00.000Z'),
      },
    ];

    prismaMock.jarEntry.findMany.mockResolvedValueOnce(weekEntries);

    const response = await request(app)
      .post('/api/notifications/send')
      .send({ familyId: FAMILY_ID, type: 'weekly' });

    expect(response.status).toBe(201);
    expect(emailMocks.sendWeeklyReflectionEmail).toHaveBeenCalledTimes(1);
    expect(emailMocks.sendWeeklyReflectionEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: ['mom@example.com', 'dad@example.com'],
        summary: expect.arrayContaining([
          expect.objectContaining({ type: 'good_thing', count: 1 }),
          expect.objectContaining({ type: 'gratitude', count: 2 }),
        ]),
        totalEntries: 3,
      }),
    );
    const weeklyEntriesArg = emailMocks.sendWeeklyReflectionEmail.mock.calls[0][0].entries;
    expect(weeklyEntriesArg).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ authorLabel: 'Dad', type: 'good_thing' }),
        expect.objectContaining({ authorLabel: 'Mom', type: 'gratitude' }),
        expect.objectContaining({ authorLabel: 'Child', type: 'gratitude' }),
      ]),
    );
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ familyId: FAMILY_ID, type: 'weekly' }),
      }),
    );
  });
});
