import { ApiProperty } from '@nestjs/swagger';
import { RideResponseDto } from './ride-response.dto';

export class RideListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Rides retrieved successfully' })
  message: string;

  @ApiProperty({ type: RideResponseDto, isArray: true })
  data: RideResponseDto[];
}

export class RideApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Ride retrieved successfully' })
  message: string;

  @ApiProperty({ type: RideResponseDto })
  data: RideResponseDto;
}

export class RideDeleteApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Ride deleted successfully' })
  message: string;

  @ApiProperty({ nullable: true, example: null, type: Object })
  data: null;
}
