import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PHONE_DIGITS_ONLY_MESSAGE } from '../../common/validation/phone-policy';
import { ACCOMMODATION_TYPES } from '../constants/accommodation-type';

export class CreateAccommodationBookingDto {
  @ApiProperty({
    description:
      'When true, guest name/email/phone are taken from the authenticated user record.',
    example: true,
  })
  @IsBoolean()
  isBookingForSelf: boolean;

  @ApiPropertyOptional({ example: 'Jane' })
  @ValidateIf((dto: CreateAccommodationBookingDto) => !dto.isBookingForSelf)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  guestFirstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @ValidateIf((dto: CreateAccommodationBookingDto) => !dto.isBookingForSelf)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  guestLastName?: string;

  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  @ValidateIf((dto: CreateAccommodationBookingDto) => !dto.isBookingForSelf)
  @IsEmail()
  @MaxLength(255)
  guestEmail?: string;

  @ApiPropertyOptional({ example: '15551234567' })
  @ValidateIf((dto: CreateAccommodationBookingDto) => !dto.isBookingForSelf)
  @Matches(/^\d{7,15}$/, { message: PHONE_DIGITS_ONLY_MESSAGE })
  guestPhone?: string;

  @ApiProperty({
    enum: ACCOMMODATION_TYPES,
    example: 'hotel',
    description:
      'Must match the accommodationType of the selected budget tier.',
  })
  @IsString()
  @IsIn([...ACCOMMODATION_TYPES])
  accommodationType: string;

  @ApiProperty({
    description:
      'Budget id from GET /accommodation/budgets for the selected accommodation type',
  })
  @IsUUID()
  budgetId: string;

  @ApiProperty({ example: 'Accra City Hotel, Independence Avenue' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  location: string;

  @ApiProperty({
    description: 'Check-in date (YYYY-MM-DD)',
    example: '2026-06-16',
  })
  @IsDateString({ strict: true })
  checkInDate: string;

  @ApiProperty({
    description: 'Check-in time (24-hour HH:mm)',
    example: '17:22',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'checkInTime must be in HH:mm format',
  })
  checkInTime: string;

  @ApiProperty({
    description: 'Check-out date (YYYY-MM-DD)',
    example: '2026-06-20',
  })
  @IsDateString({ strict: true })
  checkOutDate: string;

  @ApiPropertyOptional({
    description: 'Optional notes or special requests',
    example: 'Late check-in requested',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  additionalInfo?: string;
}
