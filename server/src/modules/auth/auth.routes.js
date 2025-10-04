import { Router } from 'express';
import {
  handleSignup,
  handleLogin,
  handleVerifyEmail,
  handleRequestPasswordReset,
  handleResetPassword,
} from './auth.controller.js';
import {
  signupRules,
  loginRules,
  verifyEmailRules,
  requestResetRules,
  resetPasswordRules,
} from './auth.validators.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, signupRules, handleSignup);
router.post('/login', authLimiter, loginRules, handleLogin);
router.post('/verify-email', authLimiter, verifyEmailRules, handleVerifyEmail);
router.post('/request-password-reset', authLimiter, requestResetRules, handleRequestPasswordReset);
router.post('/reset-password', authLimiter, resetPasswordRules, handleResetPassword);

export default router;
