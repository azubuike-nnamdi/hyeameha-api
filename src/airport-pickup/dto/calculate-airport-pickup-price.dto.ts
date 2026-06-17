import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt } from 'class-validator';
import { AIRPORT_PICKUP_PASSENGER_OPTIONS } from '../constants/airport-pickup-passengers';

export class CalculateAirportPickupPriceDto {
  @ApiProperty({
    example: 2,
    enum: AIRPORT_PICKUP_PASSENGER_OPTIONS,
    description: 'Number of passengers (1–8).',
  })
  @Type(() => Number)
  @IsInt()
  @IsIn(AIRPORT_PICKUP_PASSENGER_OPTIONS)
  passengerCount: number;
}
