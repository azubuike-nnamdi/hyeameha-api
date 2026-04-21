import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';
import { PHONE_DIGITS_ONLY_MESSAGE } from '../../common/validation/phone-policy';
import {
  STRONG_PASSWORD_MESSAGE,
  STRONG_PASSWORD_PATTERN,
} from '../../common/validation/password-policy';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Minimum 9 characters; must include uppercase, digit, and special character.',
  })
  @IsString()
  @Matches(STRONG_PASSWORD_PATTERN, { message: STRONG_PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({
    example: '15551234567',
    description:
      'Digits only (7–15 characters). No + prefix, spaces, or separators.',
  })
  @IsString()
  @Matches(/^\d{7,15}$/, { message: PHONE_DIGITS_ONLY_MESSAGE })
  phone: string;
}
