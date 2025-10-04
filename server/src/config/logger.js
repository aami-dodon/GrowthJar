import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, json, errors } = winston.format;

export const logger = winston.createLogger({
  level: env.logLevel,
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [new winston.transports.Console()],
});
