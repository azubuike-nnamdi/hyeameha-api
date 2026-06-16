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
