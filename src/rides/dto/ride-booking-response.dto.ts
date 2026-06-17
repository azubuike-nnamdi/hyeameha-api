import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RideResponseDto } from './ride-response.dto';

export class RideBookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'User id of the account that submitted the booking',
  })
  bookedByUserId: string;

  @ApiProperty()
  isBookingForSelf: boolean;

  @ApiPropertyOptional({ nullable: true, example: 'Jane' })
  guestFirstName: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Doe' })
  guestLastName: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'jane.doe@example.com' })
  guestEmail: string | null;

  @ApiPropertyOptional({ nullable: true, example: '15551234567' })
  guestPhone: string | null;

  @ApiProperty({ example: 'Accra Mall, Accra' })
  pickupLocation: string;

  @ApiProperty({ example: '2026-06-17' })
  pickupDate: string;

  @ApiProperty({ example: '09:00' })
  pickupTime: string;

  @ApiProperty({ example: 'Kumasi Central, Kumasi' })
  dropoffLocation: string;

  @ApiProperty()
  rideId: string;

  @ApiProperty({ type: RideResponseDto })
  ride: RideResponseDto;

  @ApiProperty({ example: 3 })
  numberOfDays: number;

  @ApiProperty({ example: 2 })
  passengerCount: number;

  @ApiProperty({ example: '1500.00', description: 'Calculated price in GHS' })
  price: string;

  @ApiPropertyOptional({ nullable: true })
  driverNote: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
