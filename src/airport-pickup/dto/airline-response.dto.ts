import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AirlineResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Ethiopian Airlines' })
  name: string;

  @ApiPropertyOptional({ nullable: true, example: 'ET' })
  code: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  updatedBy: string | null;
}
