import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PHONE_DIGITS_ONLY_MESSAGE } from '../../common/validation/phone-policy';

/** Profile fields only; email cannot be changed (unique). */
export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description:
      'Phone (optional): 7–15 digits only, no + or separators',
    example: '15551234567',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{7,15}$/, { message: PHONE_DIGITS_ONLY_MESSAGE })
  phone?: string;
}
