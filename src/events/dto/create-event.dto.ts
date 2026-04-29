import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const EVENT_STATUSES = ['popular', 'ongoing', 'new'] as const;

export class CreateEventDto {
  @ApiProperty({ example: 'Global Tech Expo 2026' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Convention Center, Accra' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  location: string;

  @ApiProperty({
    description: 'Image URL or path',
    example: 'https://example.com/banner.jpg',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  image: string;

  @ApiProperty({
    description: 'Calendar date (YYYY-MM-DD)',
    example: '2026-01-24',
  })
  @IsDateString({ strict: true })
  eventDate: string;

  @ApiProperty({ enum: EVENT_STATUSES, example: 'popular' })
  @IsString()
  @IsIn([...EVENT_STATUSES])
  status: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  type: string;

  @ApiProperty({ example: '$50' })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  price: string;
}
