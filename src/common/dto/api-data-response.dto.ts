import { ApiProperty } from '@nestjs/swagger';

/** Standard success envelope: `{ statusCode, message, data }`. */
export class ApiDataResponseDto<T = unknown> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Request completed successfully' })
  message: string;

  @ApiProperty({ nullable: true })
  data: T | null;
}

/** Success envelope with no payload (`data: null`). */
export class ApiMessageResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Request completed successfully' })
  message: string;

  @ApiProperty({ nullable: true, example: null })
  data: null;
}
