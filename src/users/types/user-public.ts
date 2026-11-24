import type { UserRole } from '../constants/user-role';

/** User fields exposed outside the service layer (no password or token hashes). */
export type UserPublic = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  /** Session version (not exposed in API responses). */
  tokenVersion: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
