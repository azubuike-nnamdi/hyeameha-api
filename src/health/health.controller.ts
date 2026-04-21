import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '../common';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liveness and database connectivity',
    description:
      'Public. Returns `{ status: "ok", database: "connected" }` when Postgres is reachable.',
  })
  @ApiOkResponse({
    description: 'Service is up and database query succeeded',
    schema: {
      example: { status: 'ok', database: 'connected' },
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  async check(): Promise<{ status: string; database: string }> {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok', database: 'connected' };
  }
}
