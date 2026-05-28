import { ApiProperty } from '@nestjs/swagger';
import { EventResponseDto } from './event-response.dto';

export class EventListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Events retrieved successfully' })
  message: string;

  @ApiProperty({ type: EventResponseDto, isArray: true })
  data: EventResponseDto[];
}

export class EventApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Event retrieved successfully' })
  message: string;

  @ApiProperty({ type: EventResponseDto })
  data: EventResponseDto;
}

export class EventDeleteApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Event deleted successfully' })
  message: string;

  @ApiProperty({ nullable: true, example: null })
  data: null;
}
