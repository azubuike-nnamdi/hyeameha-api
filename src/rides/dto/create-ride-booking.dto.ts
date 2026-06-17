import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PHONE_DIGITS_ONLY_MESSAGE } from '../../common/validation/phone-policy';
import {
  MAX_RIDE_BOOKING_DAYS,
  MIN_RIDE_BOOKING_DAYS,
} from '../constants/ride-booking-days';

export class CreateRideBookingDto {
  @ApiProperty({
    description:
      'When true, guest name/email/phone are taken from the authenticated user record.',
    example: true,
  })
  @IsBoolean()
  isBookingForSelf: boolean;

  @ApiPropertyOptional({ example: 'Jane' })
  @ValidateIf((dto: CreateRideBookingDto) => !dto.isBookingForSelf)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  guestFirstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @ValidateIf((dto: CreateRideBookingDto) => !dto.isBookingForSelf)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  guestLastName?: string;

  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  @ValidateIf((dto: CreateRideBookingDto) => !dto.isBookingForSelf)
  @IsEmail()
  @MaxLength(255)
  guestEmail?: string;

  @ApiPropertyOptional({ example: '15551234567' })
  @ValidateIf((dto: CreateRideBookingDto) => !dto.isBookingForSelf)
  @Matches(/^\d{7,15}$/, { message: PHONE_DIGITS_ONLY_MESSAGE })
  guestPhone?: string;

  @ApiProperty({ example: 'Accra Mall, Accra' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  pickupLocation: string;

  @ApiProperty({
    description: 'Pickup date (YYYY-MM-DD)',
    example: '2026-06-17',
  })
  @IsDateString({ strict: true })
  pickupDate: string;

  @ApiProperty({
    description: 'Pickup time (24-hour HH:mm)',
    example: '09:00',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'pickupTime must be in HH:mm format',
  })
  pickupTime: string;

  @ApiProperty({ example: 'Kumasi Central, Kumasi' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  dropoffLocation: string;

  @ApiProperty({
    description: 'Ride id from GET /rides for the selected vehicle and tier',
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

  @ApiProperty({
    example: 2,
    description: 'Must not exceed the maxPassengers of the selected ride.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  passengerCount: number;

  @ApiPropertyOptional({
    description: 'Optional note for the driver',
    example: 'Please call on arrival',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  driverNote?: string;
}
