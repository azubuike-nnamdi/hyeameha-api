import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ApiFailureLog } from './entities/api-failure-log.entity';

/** Deletes `api_failure_logs` rows older than API_FAILURE_LOG_RETENTION_DAYS. */
@Injectable()
export class ApiFailureLogRetentionCron {
  private readonly logger = new Logger(ApiFailureLogRetentionCron.name);

  constructor(
    @InjectRepository(ApiFailureLog)
    private readonly logsRepository: Repository<ApiFailureLog>,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async purgeExpiredLogs(): Promise<void> {
    const days = this.config.get<number>('API_FAILURE_LOG_RETENTION_DAYS', 30);
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const result = await this.logsRepository.delete({
      createdAt: LessThan(cutoff),
    });
    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(
        `Removed ${affected} api_failure_logs row(s) older than ${days} days`,
      );
    }
  }
}
