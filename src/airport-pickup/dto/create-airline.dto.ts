import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAirlineDto {
  @ApiProperty({ example: 'Ethiopian Airlines' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'ET',
    description: 'Optional IATA or airline code',
  })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  code?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Inactive airlines are hidden from booking selection.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
