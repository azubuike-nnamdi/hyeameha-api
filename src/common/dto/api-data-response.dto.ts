import { ApiProperty } from '@nestjs/swagger';

/** Success envelope with no payload (`data: null`). */
export class ApiMessageResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Request completed successfully' })
  message: string;

  @ApiProperty({ nullable: true, example: null })
  data: null;
}
