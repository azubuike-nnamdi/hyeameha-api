import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiFailureLog } from './entities/api-failure-log.entity';
import {
  extractErrorMessage,
  normalizeResponseBody,
  sanitizeRequestBody,
} from './utils/resolve-api-failure-tag';

export type ApiFailureLogInput = {
  tag: string;
  method: string;
  path: string;
  statusCode: number;
  responseBody: string | object;
  requestBody?: unknown;
  userId?: string | null;
  correlationId?: string | null;
  ipAddress?: string | null;
};

@Injectable()
export class ApiFailureLoggerService {
  private readonly logger = new Logger(ApiFailureLoggerService.name);

  constructor(
    @InjectRepository(ApiFailureLog)
    private readonly logsRepository: Repository<ApiFailureLog>,
  ) {}

  async recordFailure(input: ApiFailureLogInput): Promise<void> {
    const entity = this.logsRepository.create({
      tag: input.tag,
      method: input.method,
      path: input.path.split('?')[0] ?? input.path,
      statusCode: input.statusCode,
      message: extractErrorMessage(input.responseBody),
      responseBody: normalizeResponseBody(input.responseBody),
      requestBody: sanitizeRequestBody(input.requestBody),
      userId: input.userId ?? null,
      correlationId: input.correlationId ?? null,
      ipAddress: input.ipAddress ?? null,
    });
    await this.logsRepository.save(entity);
  }

  recordFailureSafe(input: ApiFailureLogInput): void {
    void this.recordFailure(input).catch((error: unknown) => {
      this.logger.error(
        `Failed to persist api_failure_log (tag=${input.tag}, status=${input.statusCode})`,
        error instanceof Error ? error.stack : String(error),
      );
    });
  }
}
