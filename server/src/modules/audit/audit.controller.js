import { prisma } from '../../config/prisma.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const listAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ status: 'success', data: logs });
  } catch (error) {
    next(error);
  }
};
