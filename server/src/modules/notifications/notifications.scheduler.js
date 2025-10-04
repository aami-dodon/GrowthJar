import cron from 'node-cron';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const scheduledJobs = [];

/**
 * Starts the configured notification cron jobs if a schedule is provided via
 * environment variables.
 */
export const startNotificationSchedulers = () => {
  const { dailyCron, weeklyCron } = env.notificationSchedules;

  if (dailyCron) {
    if (!cron.validate(dailyCron)) {
      logger.warn({ message: 'Invalid daily cron expression, skipping schedule', cron: dailyCron });
    } else {
      const job = cron.schedule(dailyCron, () => {
        logger.info({ message: 'Daily notification cron triggered', cron: dailyCron });
      });
      scheduledJobs.push(job);
      logger.info({ message: 'Daily notification cron scheduled', cron: dailyCron });
    }
  }

  if (weeklyCron) {
    if (!cron.validate(weeklyCron)) {
      logger.warn({ message: 'Invalid weekly cron expression, skipping schedule', cron: weeklyCron });
    } else {
      const job = cron.schedule(weeklyCron, () => {
        logger.info({ message: 'Weekly notification cron triggered', cron: weeklyCron });
      });
      scheduledJobs.push(job);
      logger.info({ message: 'Weekly notification cron scheduled', cron: weeklyCron });
    }
  }
};

/**
 * Stops all active notification cron jobs. Useful for tests and graceful
 * shutdowns.
 */
export const stopNotificationSchedulers = () => {
  scheduledJobs.forEach((job) => job.stop());
  scheduledJobs.length = 0;
};
