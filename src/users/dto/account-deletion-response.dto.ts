import { ApiProperty } from '@nestjs/swagger';

export class AccountDeletionDataDto {
  @ApiProperty({
    description:
      'UTC instant after which the account may be permanently deleted (typically ~7 days from now).',
  })
  scheduledPermanentDeletionAt: Date;

  @ApiProperty({ example: 7 })
  gracePeriodDays: number;
}
