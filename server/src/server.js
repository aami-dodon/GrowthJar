import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { startNotificationSchedulers } from './modules/notifications/notifications.scheduler.js';

const app = createApp();
const server = createServer(app);

if (env.nodeEnv !== 'test') {
  startNotificationSchedulers();
}

server.listen(env.port, () => {
  logger.info({ message: `Server listening on port ${env.port}` });
});
