import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.databaseUrl,
    },
  },
  log: env.nodeEnv === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
});

process.on('beforeExit', () => {
  logger.info({ message: 'Prisma client disconnecting' });
});
