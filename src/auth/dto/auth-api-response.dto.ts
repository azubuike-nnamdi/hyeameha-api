import { ApiProperty } from '@nestjs/swagger';
import { AuthResponseUserDto } from './auth-response.dto';

export class AuthSessionDataDto {
  @ApiProperty({ description: 'JWT access token (use as Bearer token)' })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (store securely for future refresh flows)',
  })
  refreshToken: string;

  @ApiProperty({ type: AuthResponseUserDto })
  user: AuthResponseUserDto;
}

export class AuthRefreshDataDto {
  @ApiProperty({ description: 'New JWT access token (use as Bearer token)' })
  accessToken: string;

  @ApiProperty({
    description:
      'New JWT refresh token (replaces the previous one; store securely)',
  })
  refreshToken: string;
}

export class AuthRegisterApiResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'Registration successful' })
  message: string;

  @ApiProperty({ type: AuthSessionDataDto })
  data: AuthSessionDataDto;
}

export class AuthLoginApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ type: AuthSessionDataDto })
  data: AuthSessionDataDto;
}

export class AuthRefreshApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Tokens refreshed' })
  message: string;

  @ApiProperty({ type: AuthRefreshDataDto })
  data: AuthRefreshDataDto;
}

export class AuthMessageApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example:
      'If an account exists for this email, a password reset code has been sent.',
  })
  message: string;

  @ApiProperty({ nullable: true, example: null })
  data: null;
}
