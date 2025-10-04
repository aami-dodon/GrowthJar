export const USER_ROLES = Object.freeze({
  PARENT: 'parent',
  CHILD: 'child',
});

export const ROLE_PERMISSIONS = Object.freeze({
  parent: [
    'family:create',
    'family:invite',
    'jar:create:good_thing',
    'jar:create:gratitude_rishi',
    'jar:create:better_choice',
    'jar:view',
    'jar:export',
  ],
  child: [
    'jar:create:gratitude_parents',
    'jar:respond:better_choice',
    'jar:view',
    'jar:export',
  ],
});
