import { ApiProperty } from '@nestjs/swagger';
import { TrainingResponseDto } from './training-response.dto';

export class TrainingListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Trainings retrieved successfully' })
  message: string;

  @ApiProperty({ type: TrainingResponseDto, isArray: true })
  data: TrainingResponseDto[];
}

export class TrainingApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Training retrieved successfully' })
  message: string;

  @ApiProperty({ type: TrainingResponseDto })
  data: TrainingResponseDto;
}

export class TrainingDeleteApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Training deleted successfully' })
  message: string;

  @ApiProperty({ nullable: true, example: null, type: Object })
  data: null;
}
