import { ApiProperty } from '@nestjs/swagger';
import { AuthResponseUserDto } from './auth-response.dto';

/** Response for `POST /auth/login`. */
export class LoginResponseDto {
  @ApiProperty({
    example: 'Login successful',
    description: 'Human-readable success message',
  })
  message: string;

  @ApiProperty({ description: 'JWT access token (use as Bearer token)' })
  accessToken: string;

  @ApiProperty({
    description:
      'JWT refresh token (store securely; hash persisted server-side)',
  })
  refreshToken: string;

  @ApiProperty({ type: AuthResponseUserDto })
  user: AuthResponseUserDto;
}
