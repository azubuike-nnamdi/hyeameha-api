import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  image: string;

  @ApiProperty({ description: 'ISO date YYYY-MM-DD' })
  eventDate: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  updatedBy: string | null;
}
