import { USER_ROLES } from './roles.js';

export const FAMILY_ROLES = Object.freeze({
  MOM: 'mom',
  DAD: 'dad',
  RISHI: 'rishi',
});

export const FAMILY_ROLE_TO_USER_ROLE = Object.freeze({
  [FAMILY_ROLES.MOM]: USER_ROLES.PARENT,
  [FAMILY_ROLES.DAD]: USER_ROLES.PARENT,
  [FAMILY_ROLES.RISHI]: USER_ROLES.CHILD,
});
