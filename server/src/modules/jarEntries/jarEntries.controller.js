import { validationResult } from 'express-validator';
import {
  createJarEntry,
  listJarEntries,
  getJarEntry,
  updateJarEntry,
  deleteJarEntry,
  summarizeJarEntries,
  listTimeline,
  respondToBetterChoice,
} from './jarEntries.service.js';
import { createHttpError } from '../../utils/errors.js';

const ensureValid = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createHttpError(422, 'Validation failed', errors.array());
  }
};

export const handleCreateEntry = async (req, res, next) => {
  try {
    ensureValid(req);
    const entry = await createJarEntry({ userId: req.user.id, ...req.body });
    res.status(201).json({ status: 'success', data: entry });
  } catch (error) {
    next(error);
  }
};

export const handleListEntries = async (req, res, next) => {
  try {
    ensureValid(req);
    const familyId = req.query.family_id ?? req.user.familyId;
    const entries = await listJarEntries({
      userId: req.user.id,
      familyId,
      filter: req.query.filter,
    });
    res.json({ status: 'success', data: entries });
  } catch (error) {
    next(error);
  }
};

export const handleGetEntry = async (req, res, next) => {
  try {
    const entry = await getJarEntry({ id: req.params.id, userId: req.user.id });
    res.json({ status: 'success', data: entry });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateEntry = async (req, res, next) => {
  try {
    ensureValid(req);
    const entry = await updateJarEntry({
      id: req.params.id,
      userId: req.user.id,
      content: req.body.content,
      metadata: req.body.metadata,
    });
    res.json({ status: 'success', data: entry });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteEntry = async (req, res, next) => {
  try {
    await deleteJarEntry({ id: req.params.id, userId: req.user.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const handleSummary = async (req, res, next) => {
  try {
    ensureValid(req);
    const summary = await summarizeJarEntries({
      userId: req.user.id,
      familyId: req.query.family_id,
      period: req.query.period,
    });
    res.json({ status: 'success', data: summary });
  } catch (error) {
    next(error);
  }
};

export const handleTimeline = async (req, res, next) => {
  try {
    ensureValid(req);
    const timeline = await listTimeline({
      userId: req.user.id,
      familyId: req.query.family_id ?? req.user.familyId,
    });
    res.json({ status: 'success', data: timeline });
  } catch (error) {
    next(error);
  }
};

export const handleRespond = async (req, res, next) => {
  try {
    ensureValid(req);
    const response = await respondToBetterChoice({
      entryId: req.params.id,
      userId: req.user.id,
      content: req.body.content,
    });
    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    next(error);
  }
};
