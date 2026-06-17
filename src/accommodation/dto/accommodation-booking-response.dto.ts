import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccommodationBudgetResponseDto } from './accommodation-budget-response.dto';
import { ACCOMMODATION_TYPES } from '../constants/accommodation-type';

export class AccommodationBookingResponseDto {
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

  @ApiProperty({ enum: ACCOMMODATION_TYPES, example: 'hotel' })
  accommodationType: string;

  @ApiProperty()
  budgetId: string;

  @ApiProperty({ type: AccommodationBudgetResponseDto })
  budget: AccommodationBudgetResponseDto;

  @ApiProperty({ example: 'Accra City Hotel, Independence Avenue' })
  location: string;

  @ApiProperty({ example: '2026-06-16' })
  checkInDate: string;

  @ApiProperty({ example: '17:22' })
  checkInTime: string;

  @ApiProperty({ example: '2026-06-20' })
  checkOutDate: string;

  @ApiProperty({ example: 4 })
  numberOfDays: number;

  @ApiPropertyOptional({ nullable: true })
  additionalInfo: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
