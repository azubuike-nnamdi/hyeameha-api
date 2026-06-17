import { ApiProperty } from '@nestjs/swagger';

export class RidePriceResponseDto {
  @ApiProperty({ example: '1500.00', description: 'Calculated price in GHS' })
  price: string;

  @ApiProperty({ example: 'GHS' })
  currency: string;

  @ApiProperty({ example: '500.00', description: 'Daily rate in GHS' })
  pricePerDay: string;

  @ApiProperty({ example: 3 })
  numberOfDays: number;
}
