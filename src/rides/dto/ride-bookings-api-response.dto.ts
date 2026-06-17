import { ApiProperty } from '@nestjs/swagger';
import { RideBookingResponseDto } from './ride-booking-response.dto';
import { RidePriceResponseDto } from './ride-price-response.dto';

export class RideBookingListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Ride bookings retrieved successfully' })
  message: string;

  @ApiProperty({ type: RideBookingResponseDto, isArray: true })
  data: RideBookingResponseDto[];
}

export class RideBookingApiResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'Ride booking created successfully' })
  message: string;

  @ApiProperty({ type: RideBookingResponseDto })
  data: RideBookingResponseDto;
}

export class RidePriceApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Ride price calculated successfully' })
  message: string;

  @ApiProperty({ type: RidePriceResponseDto })
  data: RidePriceResponseDto;
}
