import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public, apiResponse } from '../common';
import { HealthApiResponseDto } from './dto/health-api-response.dto';
import { HEALTH_CHECK_SUCCESS_MESSAGE } from './health.messages';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liveness and database connectivity',
    description:
      'Public. Returns service and database status in `data` when Postgres is reachable.',
  })
  @ApiOkResponse({ type: HealthApiResponseDto })
  async check() {
    await this.dataSource.query('SELECT 1');
    return apiResponse(
      { status: 'ok', database: 'connected' },
      HEALTH_CHECK_SUCCESS_MESSAGE,
    );
  }
}
