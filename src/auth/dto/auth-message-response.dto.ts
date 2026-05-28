import { ApiProperty } from '@nestjs/swagger';

export class AuthMessageResponseDto {
  @ApiProperty({ example: 'If an account exists, a reset code has been sent.' })
  message: string;
}
