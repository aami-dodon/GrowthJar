import { validationResult } from 'express-validator';
import {
  signup,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from './auth.service.js';
import { AppError, createHttpError } from '../../utils/errors.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { childProfile } from '../../shared/constants/childProfile.js';

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createHttpError(422, 'Validation failed', errors.array());
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const handleSignup = async (req, res, next) => {
  try {
    handleValidation(req);
    const user = await signup(req.body);
    res
      .status(201)
      .json({
        status: 'success',
        data: { id: user.id, email: user.email, familyRole: user.familyRole },
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const handleLogin = async (req, res, next) => {
  try {
    handleValidation(req);
    const { token, user } = await login(req.body);
    res.json({
      status: 'success',
      data: {
        token,
        expiresIn: env.jwtExpiresIn,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          familyRole: user.familyRole,
          emailVerified: user.emailVerified,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleVerifyEmail = async (req, res, next) => {
  try {
    handleValidation(req);
    await verifyEmail(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

const renderVerificationPage = ({
  variant,
  heading,
  message,
  actionUrl,
  actionLabel,
}) => {
  const isSuccess = variant === 'success';
  const accent = isSuccess ? '#16a34a' : '#ef4444';
  const buttonColor = isSuccess ? '#0f172a' : '#1f2937';
  const buttonHover = isSuccess ? '#111827' : '#111827';

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email verification | ${childProfile.jarName}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f0f9ff, #ffffff 45%, #f0fdf4);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          color: #0f172a;
        }
        .card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 28px;
          padding: 40px 36px;
          box-shadow: 0 32px 60px -48px rgba(15, 23, 42, 0.45);
          text-align: center;
          backdrop-filter: blur(18px);
        }
        .badge {
          display: inline-flex;
          width: 72px;
          height: 72px;
          border-radius: 24px;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, ${accent}, #0ea5e9);
        }
        h1 {
          margin: 0 0 12px;
          font-size: 28px;
          line-height: 1.25;
        }
        p {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: #334155;
        }
        .action {
          margin-top: 32px;
          display: inline-flex;
          padding: 14px 28px;
          border-radius: 9999px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          color: #ffffff;
          background: ${buttonColor};
          box-shadow: 0 20px 30px -24px rgba(15, 23, 42, 0.55);
        }
        .action:hover,
        .action:focus-visible {
          background: ${buttonHover};
        }
      </style>
    </head>
    <body>
      <main class="card">
        <div class="badge">RJ</div>
        <h1>${heading}</h1>
        <p>${message}</p>
        <a class="action" href="${actionUrl}">${actionLabel}</a>
      </main>
    </body>
  </html>`;
};

const sendVerificationPage = (res, statusCode, options) => {
  res.status(statusCode).type('html').send(renderVerificationPage(options));
};

const clientHomeUrl = () => env.clientAppUrl ?? 'https://rishisjar.com';

export const handleVerifyEmailLink = async (req, res) => {
  const tokenParam = req.query.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const trimmedToken = typeof token === 'string' ? token.trim() : '';

  if (!trimmedToken || trimmedToken.length < 10) {
    sendVerificationPage(res, 400, {
      variant: 'error',
      heading: 'Verification link is invalid',
      message: 'The verification link is missing or malformed. Request a new email verification link to continue.',
      actionUrl: clientHomeUrl(),
      actionLabel: `Return to ${childProfile.jarName}`,
    });
    return;
  }

  try {
    await verifyEmail({ token: trimmedToken });
    sendVerificationPage(res, 200, {
      variant: 'success',
      heading: 'Email verified',
      message: `Your email address has been confirmed. You can sign in to ${childProfile.jarName} now.`,
      actionUrl: clientHomeUrl(),
      actionLabel: 'Go to sign in',
    });
  } catch (error) {
    if (error instanceof AppError) {
      sendVerificationPage(res, error.statusCode ?? 400, {
        variant: 'error',
        heading: 'Verification failed',
        message:
          error.message ??
          'We could not verify that link. Request a new verification email and try again.',
        actionUrl: clientHomeUrl(),
        actionLabel: 'Try again',
      });
      return;
    }

    logger.error({ message: 'Unexpected error while verifying email via link', error });
    sendVerificationPage(res, 500, {
      variant: 'error',
      heading: 'Something went wrong',
      message: 'We could not verify your email because of an unexpected error. Please request a new link and try again.',
      actionUrl: clientHomeUrl(),
      actionLabel: `Return to ${childProfile.jarName}`,
    });
  }
};

export const handleRequestPasswordReset = async (req, res, next) => {
  try {
    handleValidation(req);
    await requestPasswordReset(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

export const handleResetPassword = async (req, res, next) => {
  try {
    handleValidation(req);
    await resetPassword(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};
