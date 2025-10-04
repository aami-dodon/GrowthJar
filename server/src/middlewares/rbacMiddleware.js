import { ROLE_PERMISSIONS } from '../shared/constants/roles.js';
import { createHttpError } from '../utils/errors.js';

export const requirePermission = (...permissions) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    return next(createHttpError(403, 'Access denied'));
  }

  const rolePermissions = ROLE_PERMISSIONS[role] ?? [];
  const isAllowed = permissions.every((permission) => rolePermissions.includes(permission));

  if (!isAllowed) {
    return next(createHttpError(403, 'Insufficient permissions'));
  }

  return next();
};
