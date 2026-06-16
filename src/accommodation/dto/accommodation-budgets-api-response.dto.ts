import { ApiProperty } from '@nestjs/swagger';
import { AccommodationBudgetResponseDto } from './accommodation-budget-response.dto';

export class AccommodationBudgetListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Accommodation budgets retrieved successfully' })
  message: string;

  @ApiProperty({ type: AccommodationBudgetResponseDto, isArray: true })
  data: AccommodationBudgetResponseDto[];
}

export class AccommodationBudgetApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Accommodation budget retrieved successfully' })
  message: string;

  @ApiProperty({ type: AccommodationBudgetResponseDto })
  data: AccommodationBudgetResponseDto;
}

export class AccommodationBudgetDeleteApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Accommodation budget deleted successfully' })
  message: string;

  @ApiProperty({ nullable: true, example: null, type: Object })
  data: null;
}
