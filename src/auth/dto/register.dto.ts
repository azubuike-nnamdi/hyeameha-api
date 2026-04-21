import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';
import { PHONE_DIGITS_ONLY_MESSAGE } from '../../common/validation/phone-policy';
import { STRONG_PASSWORD_MESSAGE } from '../../common/validation/password-policy';

export class RegisterDto {
  @ApiProperty({ example: 'you@example.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Secure1!Pass',
    required: true,
    description:
      'Minimum 9 characters; must include uppercase, digit, and special character.',
  })
  @IsString()
  // Inline regex (not imported) so the Nest Swagger plugin emits a valid OpenAPI pattern; keep aligned with password-policy.ts
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/, {
    message: STRONG_PASSWORD_MESSAGE,
  })
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
