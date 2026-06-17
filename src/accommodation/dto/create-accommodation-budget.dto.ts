import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ACCOMMODATION_TYPES } from '../constants/accommodation-type';

export class CreateAccommodationBudgetDto {
  @ApiProperty({
    enum: ACCOMMODATION_TYPES,
    example: 'hotel',
    description: 'Accommodation type this budget tier belongs to.',
  })
  @IsString()
  @IsIn([...ACCOMMODATION_TYPES])
  accommodationType: string;

  @ApiProperty({
    example: 'Premium',
    description:
      'Budget tier for the accommodation type. Hotel: Standard, Premium, Luxury, VIP. Guesthouse, apartment, villa: Economy, Standard, Premium, Luxury. B&B and hostel: Standard only.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name: string;

  @ApiProperty({
    example: 40,
    description:
      'Minimum nightly price. When maxPrice is omitted, this is the fixed nightly rate.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice: number;

  @ApiPropertyOptional({
    example: 150,
    description:
      'Maximum nightly price for a range. Omit for a fixed price (e.g. B&B at $40).',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number | null;
}
