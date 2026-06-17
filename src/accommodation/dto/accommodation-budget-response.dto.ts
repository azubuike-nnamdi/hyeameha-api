import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ACCOMMODATION_TYPES } from '../constants/accommodation-type';

export class AccommodationBudgetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ACCOMMODATION_TYPES, example: 'hotel' })
  accommodationType: string;

  @ApiProperty({
    example: 'Premium',
    description: 'Budget tier within the accommodation type.',
  })
  name: string;

  @ApiProperty({
    enum: ['fixed', 'range'],
    example: 'range',
    description:
      'fixed when only minPrice applies; range when minPrice and maxPrice define a band.',
  })
  pricingType: 'fixed' | 'range';

  @ApiProperty({
    example: '40.00',
    description:
      'Minimum nightly price, or the fixed rate when pricingType is fixed.',
  })
  minPrice: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '150.00',
    description: 'Maximum nightly price; null for fixed-price tiers.',
  })
  maxPrice: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  updatedBy: string | null;
}
