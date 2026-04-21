import { ApiProperty } from '@nestjs/swagger';

/** User object embedded in auth responses (sanitized; no secrets). */
export class AuthResponseUserDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({
    example: '15551234567',
    nullable: true,
    description: 'Digits only; set at registration / profile update',
  })
  phone: string | null;
}

/** Response for `POST /auth/register` — includes refresh token. */
export class RegisterResponseDto {
  @ApiProperty({
    example: 'Registration successful',
    description: 'Human-readable success message',
  })
  message: string;

  @ApiProperty({ description: 'JWT access token (use as Bearer token)' })
  accessToken: string;

  @ApiProperty({
    description:
      'JWT refresh token (register only; store securely for future refresh flows)',
  })
  refreshToken: string;

  @ApiProperty({ type: AuthResponseUserDto })
  user: AuthResponseUserDto;
}
