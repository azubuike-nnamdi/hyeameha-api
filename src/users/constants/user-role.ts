export const USER_ROLES = ['user', 'editor', 'admin', 'super_admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = 'user';

/** Roles allowed to create, update, and delete trainings. */
export const TRAINING_MANAGE_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'editor',
];

/** Roles allowed to manage accommodation budgets. */
export const BUDGET_MANAGE_ROLES: UserRole[] = ['super_admin', 'admin'];

/** Roles that can list all accommodation bookings (not only their own). */
export const BOOKING_ADMIN_ROLES: UserRole[] = ['super_admin', 'admin'];

/** Roles allowed to list all users. */
export const USER_LIST_ROLES: UserRole[] = ['super_admin', 'admin'];

/** Roles allowed to create, update, and delete airlines. */
export const AIRLINE_MANAGE_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'editor',
];

/** Roles that can list all airport pickup bookings (not only their own). */
export const AIRPORT_PICKUP_BOOKING_ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'admin',
];

/** Roles allowed to create, update, and delete ride catalog entries. */
export const RIDE_MANAGE_ROLES: UserRole[] = ['super_admin', 'admin', 'editor'];

/** Roles that can list all ride bookings (not only their own). */
export const RIDE_BOOKING_ADMIN_ROLES: UserRole[] = ['super_admin', 'admin'];
