import type { UserRole } from '../../users/constants/user-role';

/** Attached to the request after JWT validation */
export type JwtPayloadUser = {
  sub: string;
  email: string;
  role: UserRole;
};
