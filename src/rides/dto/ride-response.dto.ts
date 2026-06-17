import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SERVICE_TIERS } from '../constants/service-tier';
import { VEHICLE_TYPES } from '../constants/vehicle-type';

export class RideResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: VEHICLE_TYPES, example: 'saloon' })
  vehicleType: string;

  @ApiProperty({ enum: SERVICE_TIERS, example: 'regular' })
  serviceTier: string;

  @ApiProperty({ example: 3 })
  maxPassengers: number;

  @ApiProperty({ example: 2 })
  maxLuggage: number;

  @ApiProperty()
  description: string;

  @ApiProperty({ example: 'https://example.com/saloon.jpg' })
  imageUrl: string;

  @ApiProperty({
    example: '500.00',
    description: 'Daily rate in GHS',
  })
  pricePerDay: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  updatedBy: string | null;
}
