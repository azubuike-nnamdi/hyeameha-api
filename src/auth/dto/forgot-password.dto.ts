import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { NormalizeEmail } from '../../common/validation/normalize-email';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'you@example.com' })
  @NormalizeEmail()
  @IsEmail()
  email: string;
}
