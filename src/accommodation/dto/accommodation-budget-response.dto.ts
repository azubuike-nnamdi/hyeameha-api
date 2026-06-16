import { ApiProperty } from '@nestjs/swagger';

export class AccommodationBudgetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Standard' })
  name: string;

  @ApiProperty({ example: '2.00' })
  minPrice: string;

  @ApiProperty({ example: '3.00' })
  maxPrice: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  updatedBy: string | null;
}
