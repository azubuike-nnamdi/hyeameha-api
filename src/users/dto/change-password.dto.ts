import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  STRONG_PASSWORD_MESSAGE,
} from '../../common/validation/password-policy';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  currentPassword: string;

  @ApiProperty({
    description:
      '9–72 characters; must include uppercase, digit, and special character. Signs out all sessions.',
  })
  @IsString()
  // Inline regex so the Nest Swagger plugin emits a valid OpenAPI pattern; keep aligned with password-policy.ts
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/, {
    message: STRONG_PASSWORD_MESSAGE,
  })
  @MaxLength(PASSWORD_MAX_LENGTH)
  newPassword: string;
}
