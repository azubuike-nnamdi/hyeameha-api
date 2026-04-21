import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';
import {
  E164_PHONE_MESSAGE,
  E164_PHONE_PATTERN,
} from '../../common/validation/phone-policy';
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
    example: '+15551234567',
    description: 'E.164 international format',
  })
  @IsString()
  @Matches(E164_PHONE_PATTERN, { message: E164_PHONE_MESSAGE })
  phone: string;
}
