import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AirlineResponseDto } from './airline-response.dto';

export class AirportPickupBookingResponseDto {
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

  @ApiProperty({ example: 'Kotoka International Airport (Accra)' })
  pickupLocation: string;

  @ApiProperty({ example: 'East Legon, Accra' })
  dropoffLocation: string;

  @ApiProperty({ example: 2 })
  passengerCount: number;

  @ApiProperty()
  airlineId: string;

  @ApiProperty({ type: AirlineResponseDto })
  airline: AirlineResponseDto;

  @ApiProperty({ example: '14:30' })
  arrivalTime: string;

  @ApiProperty({ example: '2026-06-17' })
  pickupDate: string;

  @ApiProperty({ example: '08:33' })
  pickupTime: string;

  @ApiProperty({ example: '200.00', description: 'Calculated price in GHS' })
  price: string;

  @ApiPropertyOptional({ nullable: true })
  additionalNote: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
