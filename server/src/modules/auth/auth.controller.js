import { validationResult } from 'express-validator';
import {
  signup,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from './auth.service.js';
import { createHttpError } from '../../utils/errors.js';
import { env } from '../../config/env.js';

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
    res.status(201).json({ status: 'success', data: { id: user.id, email: user.email } });
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
