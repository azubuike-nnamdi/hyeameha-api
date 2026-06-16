import type { UserRole } from '../../users/constants/user-role';
import { DEFAULT_USER_ROLE, USER_ROLES } from '../../users/constants/user-role';
import type { UserPublic } from '../../users/types/user-public';
import type { JwtPayloadUser } from '../types/jwt-payload-user';

function toUserRole(value: string): UserRole {
  if ((USER_ROLES as readonly string[]).includes(value)) {
    return value as UserRole;
  }
  return DEFAULT_USER_ROLE;
}

export function toJwtPayloadUser(user: UserPublic): JwtPayloadUser {
  return {
    sub: user.id,
    email: user.email,
    role: toUserRole(user.role),
  };
}
