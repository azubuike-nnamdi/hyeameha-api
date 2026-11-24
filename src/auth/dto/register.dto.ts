import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';
import { PHONE_DIGITS_ONLY_MESSAGE } from '../../common/validation/phone-policy';
import {
  PASSWORD_MAX_LENGTH,
  STRONG_PASSWORD_MESSAGE,
} from '../../common/validation/password-policy';
import { NormalizeEmail } from '../../common/validation/normalize-email';

export class RegisterDto {
  @ApiProperty({ example: 'you@example.com', required: true })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'Secure1!Pass',
    required: true,
    description:
      '9–72 characters; must include uppercase, digit, and special character.',
  })
  @IsString()
  // Inline regex (not imported) so the Nest Swagger plugin emits a valid OpenAPI pattern; keep aligned with password-policy.ts
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/, {
    message: STRONG_PASSWORD_MESSAGE,
  })
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;

  @ApiProperty({ example: 'Ada', required: true })
  @IsString()
  @MaxLength(120)
  firstName: string;

  @ApiProperty({ example: 'Lovelace', required: true })
  @IsString()
  @MaxLength(120)
  lastName: string;

  @ApiProperty({
    example: '15551234567',
    required: true,
    description:
      'Digits only (7–15 characters). No + prefix, spaces, or separators.',
  })
  @IsString()
  // Inline regex so the Nest Swagger plugin emits a valid OpenAPI pattern; keep aligned with phone-policy.ts
  @Matches(/^\d{7,15}$/, { message: PHONE_DIGITS_ONLY_MESSAGE })
  phone: string;
}
