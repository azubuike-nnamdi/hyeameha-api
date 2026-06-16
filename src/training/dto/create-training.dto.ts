import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTrainingDto {
  @ApiProperty({ example: 'Hair Braiding' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Hyeameha Training Centre, Accra' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  location: string;

  @ApiProperty({
    description: 'Session start time (display format)',
    example: '9:00 AM',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  startTime: string;

  @ApiProperty({
    description: 'Session end time (display format)',
    example: '11:00 PM',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  endTime: string;

  @ApiProperty({ example: '2 hours' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  duration: string;

  @ApiProperty({
    type: [String],
    example: [
      'Introduction to Hair Braiding Techniques',
      'Basic Braiding Patterns (Simple braids, French braids)',
      'Hands-On Practice with Guidance',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(500, { each: true })
  topics: string[];
}
