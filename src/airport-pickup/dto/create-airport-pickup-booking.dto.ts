import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PHONE_DIGITS_ONLY_MESSAGE } from '../../common/validation/phone-policy';
import { DEFAULT_PICKUP_LOCATION } from '../constants/airport-pickup-pricing';
import { AIRPORT_PICKUP_PASSENGER_OPTIONS } from '../constants/airport-pickup-passengers';

export class CreateAirportPickupBookingDto {
  @ApiProperty({
    description:
      'When true, guest name/email/phone are taken from the authenticated user record.',
    example: true,
  })
  @IsBoolean()
  isBookingForSelf: boolean;

  @ApiPropertyOptional({ example: 'Jane' })
  @ValidateIf((dto: CreateAirportPickupBookingDto) => !dto.isBookingForSelf)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  guestFirstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @ValidateIf((dto: CreateAirportPickupBookingDto) => !dto.isBookingForSelf)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  guestLastName?: string;

  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  @ValidateIf((dto: CreateAirportPickupBookingDto) => !dto.isBookingForSelf)
  @IsEmail()
  @MaxLength(255)
  guestEmail?: string;

  @ApiPropertyOptional({ example: '15551234567' })
  @ValidateIf((dto: CreateAirportPickupBookingDto) => !dto.isBookingForSelf)
  @Matches(/^\d{7,15}$/, { message: PHONE_DIGITS_ONLY_MESSAGE })
  guestPhone?: string;

  @ApiProperty({
    example: DEFAULT_PICKUP_LOCATION,
    default: DEFAULT_PICKUP_LOCATION,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  pickupLocation: string;

  @ApiProperty({ example: 'East Legon, Accra' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  dropoffLocation: string;

  @ApiProperty({
    example: 2,
    enum: AIRPORT_PICKUP_PASSENGER_OPTIONS,
    description: 'Number of passengers (1–8).',
  })
  @IsInt()
  @IsIn(AIRPORT_PICKUP_PASSENGER_OPTIONS)
  passengerCount: number;

  @ApiProperty({
    description: 'Airline id from GET /airport-pickup/airlines',
  })
  @IsUUID()
  airlineId: string;

  @ApiProperty({
    description: 'Flight arrival time (24-hour HH:mm)',
    example: '14:30',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'arrivalTime must be in HH:mm format',
  })
  arrivalTime: string;

  @ApiProperty({
    description: 'Pickup date (YYYY-MM-DD)',
    example: '2026-06-17',
  })
  @IsDateString({ strict: true })
  pickupDate: string;

  @ApiProperty({
    description: 'Pickup time (24-hour HH:mm)',
    example: '08:33',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'pickupTime must be in HH:mm format',
  })
  pickupTime: string;

  @ApiPropertyOptional({
    description: 'Optional notes or special requests',
    example: 'Large luggage, need child seat',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  additionalNote?: string;
}
