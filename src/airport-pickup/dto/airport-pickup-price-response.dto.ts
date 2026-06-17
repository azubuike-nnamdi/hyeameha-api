import { ApiProperty } from '@nestjs/swagger';

export class AirportPickupPriceResponseDto {
  @ApiProperty({ example: '200.00', description: 'Calculated price in GHS' })
  price: string;

  @ApiProperty({ example: 'GHS' })
  currency: string;

  @ApiProperty({ example: 2 })
  passengerCount: number;
}
