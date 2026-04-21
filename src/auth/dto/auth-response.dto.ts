import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ example: '+15551234567', nullable: true })
  phone: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({
    description:
      'JWT refresh token (store securely; use to obtain new access tokens)',
  })
  refreshToken: string;

  @ApiProperty({ type: AuthResponseUserDto })
  user: AuthResponseUserDto;
}
