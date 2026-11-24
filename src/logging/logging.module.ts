import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiFailureLog } from './entities/api-failure-log.entity';
import { ApiFailureLoggerService } from './api-failure-logger.service';
import { ApiExceptionFilter } from './filters/api-exception.filter';
import { ApiFailureLogRetentionCron } from './api-failure-log-retention.cron';

@Module({
  imports: [TypeOrmModule.forFeature([ApiFailureLog])],
  providers: [
    ApiFailureLoggerService,
    ApiFailureLogRetentionCron,
    ApiExceptionFilter,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
  exports: [ApiFailureLoggerService],
})
export class LoggingModule {}
