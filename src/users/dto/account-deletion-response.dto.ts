import { ApiProperty } from '@nestjs/swagger';

export class AccountDeletionResponseDto {
  @ApiProperty({
    description:
      'Human-readable explanation of soft delete and the 7-day retention before permanent removal.',
  })
  message: string;

  @ApiProperty({
    description:
      'UTC instant after which the account may be permanently deleted (typically ~7 days from now).',
  })
  scheduledPermanentDeletionAt: Date;

  @ApiProperty({ example: 7 })
  gracePeriodDays: number;
}
