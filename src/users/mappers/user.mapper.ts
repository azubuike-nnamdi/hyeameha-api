import { UserResponseDto } from '../dto/user-response.dto';
import type { User } from '../entities/user.entity';
import type { UserPublic } from '../types/user-public';

export function toUserResponseDto(user: User | UserPublic): UserResponseDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
