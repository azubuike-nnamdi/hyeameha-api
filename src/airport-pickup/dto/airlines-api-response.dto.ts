import { ApiProperty } from '@nestjs/swagger';
import { AirlineResponseDto } from './airline-response.dto';

export class AirlineListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Airlines retrieved successfully' })
  message: string;

  @ApiProperty({ type: AirlineResponseDto, isArray: true })
  data: AirlineResponseDto[];
}

export class AirlineApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Airline retrieved successfully' })
  message: string;

  @ApiProperty({ type: AirlineResponseDto })
  data: AirlineResponseDto;
}

export class AirlineDeleteApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Airline deleted successfully' })
  message: string;

  @ApiProperty({ nullable: true, example: null, type: Object })
  data: null;
}
