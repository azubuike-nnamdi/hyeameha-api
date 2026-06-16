import { ApiProperty } from '@nestjs/swagger';
import { AccommodationBookingResponseDto } from './accommodation-booking-response.dto';

export class AccommodationBookingListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Accommodation bookings retrieved successfully' })
  message: string;

  @ApiProperty({ type: AccommodationBookingResponseDto, isArray: true })
  data: AccommodationBookingResponseDto[];
}

export class AccommodationBookingApiResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'Accommodation booking created successfully' })
  message: string;

  @ApiProperty({ type: AccommodationBookingResponseDto })
  data: AccommodationBookingResponseDto;
}
