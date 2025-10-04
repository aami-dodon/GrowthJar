import { verifyToken } from '../utils/jwt.js';
import { createHttpError } from '../utils/errors.js';
import { prisma } from '../config/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw createHttpError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user) {
      throw createHttpError(401, 'User not found');
    }

    if (!user.emailVerified) {
      throw createHttpError(403, 'Email verification required');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
