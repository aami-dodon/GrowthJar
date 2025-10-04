import { validationResult } from 'express-validator';
import { createFamily, getFamily, inviteMember, acceptInvitation } from './families.service.js';
import { createHttpError } from '../../utils/errors.js';

const assertValid = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createHttpError(422, 'Validation failed', errors.array());
  }
};

export const handleCreateFamily = async (req, res, next) => {
  try {
    assertValid(req);
    const family = await createFamily({ familyName: req.body.familyName, userId: req.user.id });
    res.status(201).json({ status: 'success', data: family });
  } catch (error) {
    next(error);
  }
};

export const handleGetFamily = async (req, res, next) => {
  try {
    const family = await getFamily({ familyId: req.params.id, userId: req.user.id });
    res.json({ status: 'success', data: family });
  } catch (error) {
    next(error);
  }
};

export const handleInviteMember = async (req, res, next) => {
  try {
    assertValid(req);
    await inviteMember({
      email: req.body.email,
      role: req.body.role,
      familyId: req.body.familyId ?? req.user.familyId,
      inviterId: req.user.id,
    });
    res.status(201).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

export const handleAcceptInvite = async (req, res, next) => {
  try {
    assertValid(req);
    await acceptInvitation(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};
