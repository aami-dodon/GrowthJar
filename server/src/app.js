import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import routes from './routes/index.js';
import docsRoute from './routes/docs.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { handleVerifyEmailLink } from './modules/auth/auth.controller.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(generalLimiter);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
          return callback(null, origin ?? true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/verify-email', handleVerifyEmailLink);

  app.use('/docs', docsRoute);
  app.use('/api', routes);

  app.use(errorHandler);

  return app;
};
