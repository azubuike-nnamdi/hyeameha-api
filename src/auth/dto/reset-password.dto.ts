import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { STRONG_PASSWORD_MESSAGE } from '../../common/validation/password-policy';

export class ResetPasswordDto {
  @ApiProperty({ example: 'you@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '482910',
    description: 'One-time code sent to the user email',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  otp: string;

  @ApiProperty({
    example: 'Secure1!Pass',
    description:
      'Minimum 9 characters; must include uppercase, digit, and special character.',
  })
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/, {
    message: STRONG_PASSWORD_MESSAGE,
  })
  newPassword: string;
}
