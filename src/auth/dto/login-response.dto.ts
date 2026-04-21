import { ApiProperty } from '@nestjs/swagger';
import { AuthResponseUserDto } from './auth-response.dto';

/**
 * Response for `POST /auth/login`.
 * Body is only `{ email, password }`. No refresh token in request or response.
 */
export class LoginResponseDto {
  @ApiProperty({
    example: 'Login successful',
    description: 'Human-readable success message',
  })
  message: string;

  @ApiProperty({ description: 'JWT access token (use as Bearer token)' })
  accessToken: string;

  @ApiProperty({ type: AuthResponseUserDto })
  user: AuthResponseUserDto;
}
