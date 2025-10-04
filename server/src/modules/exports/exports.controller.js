import { validationResult } from 'express-validator';
import { exportCsv, exportPdf } from './exports.service.js';
import { createHttpError } from '../../utils/errors.js';

const ensureValid = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createHttpError(422, 'Validation failed', errors.array());
  }
};

export const handleExportCsv = async (req, res, next) => {
  try {
    ensureValid(req);
    const buffer = await exportCsv({
      userId: req.user.id,
      familyId: req.query.family_id,
      period: req.query.period,
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="jar-entries.csv"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const handleExportPdf = async (req, res, next) => {
  try {
    ensureValid(req);
    const buffer = await exportPdf({
      userId: req.user.id,
      familyId: req.query.family_id,
      period: req.query.period,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="jar-entries.pdf"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
