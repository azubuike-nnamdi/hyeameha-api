import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { NormalizeEmail } from '../../common/validation/normalize-email';

export class LoginDto {
  @ApiProperty({ example: 'you@example.com' })
  @NormalizeEmail()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'a-secure-password',
    description: 'Plain password (no refresh token in this request).',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}
