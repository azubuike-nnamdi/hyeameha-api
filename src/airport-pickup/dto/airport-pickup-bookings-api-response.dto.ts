import { ApiProperty } from '@nestjs/swagger';
import { AirportPickupBookingResponseDto } from './airport-pickup-booking-response.dto';
import { AirportPickupPriceResponseDto } from './airport-pickup-price-response.dto';

export class AirportPickupBookingListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Airport pickup bookings retrieved successfully' })
  message: string;

  @ApiProperty({ type: AirportPickupBookingResponseDto, isArray: true })
  data: AirportPickupBookingResponseDto[];
}

export class AirportPickupBookingApiResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'Airport pickup booking created successfully' })
  message: string;

  @ApiProperty({ type: AirportPickupBookingResponseDto })
  data: AirportPickupBookingResponseDto;
}

export class AirportPickupPriceApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Airport pickup price calculated successfully' })
  message: string;

  @ApiProperty({ type: AirportPickupPriceResponseDto })
  data: AirportPickupPriceResponseDto;
}
