import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';
import {
  MAX_RIDE_BOOKING_DAYS,
  MIN_RIDE_BOOKING_DAYS,
} from '../constants/ride-booking-days';

export class CalculateRidePriceDto {
  @ApiProperty({
    description: 'Ride id from GET /rides',
  })
  @IsUUID()
  rideId: string;

  @ApiProperty({
    example: 3,
    minimum: MIN_RIDE_BOOKING_DAYS,
    maximum: MAX_RIDE_BOOKING_DAYS,
  })
  @Type(() => Number)
  @IsInt()
  @Min(MIN_RIDE_BOOKING_DAYS)
  numberOfDays: number;
}
