import { ApiProperty } from '@nestjs/swagger';

export class TrainingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Hair Braiding' })
  title: string;

  @ApiProperty({ example: 'Hyeameha Training Centre, Accra' })
  location: string;

  @ApiProperty({ example: '9:00 AM' })
  startTime: string;

  @ApiProperty({ example: '11:00 PM' })
  endTime: string;

  @ApiProperty({ example: '2 hours' })
  duration: string;

  @ApiProperty({ type: [String] })
  topics: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  updatedBy: string | null;
}
