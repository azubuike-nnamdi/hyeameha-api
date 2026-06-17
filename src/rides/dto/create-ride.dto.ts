import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { SERVICE_TIERS } from '../constants/service-tier';
import { VEHICLE_TYPES } from '../constants/vehicle-type';

export class CreateRideDto {
  @ApiProperty({
    enum: VEHICLE_TYPES,
    example: 'saloon',
    description: 'Vehicle category (Saloon, SUV, Mini Bus, Coach).',
  })
  @IsString()
  @IsIn([...VEHICLE_TYPES])
  vehicleType: string;

  @ApiProperty({
    enum: SERVICE_TIERS,
    example: 'regular',
    description: 'Service tier (Regular, Comfort, VVIP).',
  })
  @IsString()
  @IsIn([...SERVICE_TIERS])
  serviceTier: string;

  @ApiProperty({
    example: 3,
    description: 'Maximum passengers this vehicle can carry.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPassengers: number;

  @ApiProperty({
    example: 2,
    description: 'Maximum luggage pieces this vehicle can carry.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxLuggage: number;

  @ApiProperty({
    example:
      'A sophisticated exterior with smooth lines and a modern silhouette.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  description: string;

  @ApiProperty({
    description: 'Public URL of the vehicle image',
    example: 'https://example.com/saloon.jpg',
  })
  @IsString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  imageUrl: string;

  @ApiProperty({
    example: 500,
    description: 'Daily rate in GHS used to calculate booking price.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerDay: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Inactive rides are hidden from booking selection.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
