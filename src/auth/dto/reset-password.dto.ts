import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  STRONG_PASSWORD_MESSAGE,
} from '../../common/validation/password-policy';
import { NormalizeEmail } from '../../common/validation/normalize-email';

export class ResetPasswordDto {
  @ApiProperty({ example: 'you@example.com' })
  @NormalizeEmail()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '482910',
    description: 'One-time code sent to the user email',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  @Matches(/^\d+$/, { message: 'otp must contain digits only' })
  otp: string;

  @ApiProperty({
    example: 'Secure1!Pass',
    description:
      '9–72 characters; must include uppercase, digit, and special character.',
  })
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/, {
    message: STRONG_PASSWORD_MESSAGE,
  })
  @MaxLength(PASSWORD_MAX_LENGTH)
  newPassword: string;
}
