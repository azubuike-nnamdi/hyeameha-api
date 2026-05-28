import { ApiProperty } from '@nestjs/swagger';

/** Response for `POST /auth/refresh`. */
export class RefreshResponseDto {
  @ApiProperty({
    example: 'Tokens refreshed',
    description: 'Human-readable success message',
  })
  message: string;

  @ApiProperty({ description: 'New JWT access token (use as Bearer token)' })
  accessToken: string;

  @ApiProperty({
    description:
      'New JWT refresh token (replaces the previous one; store securely)',
  })
  refreshToken: string;
}
