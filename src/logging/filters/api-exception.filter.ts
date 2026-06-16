import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  type ExecutionContext,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { API_FAILURE_TAG_KEY } from '../decorators/api-failure-tag.decorator';
import { ApiFailureLoggerService } from '../api-failure-logger.service';
import {
  resolveApiFailureTag,
  shouldSkipApiFailureLog,
} from '../utils/resolve-api-failure-tag';
import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from '../../common/constants/headers';
import { normalizeApiErrorResponse } from '../../common/utils/normalize-api-error-response.util';
import type { ApiDataResponse } from '../../common/utils/api-response.util';
import type { JwtPayloadUser } from '../../auth/types/jwt-payload-user';

type HttpExceptionResponseBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly failureLogger: ApiFailureLoggerService,
    private readonly reflector: Reflector,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody: string | HttpExceptionResponseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const normalizedBody: ApiDataResponse<Record<string, unknown> | null> =
      normalizeApiErrorResponse(status, responseBody);

    if (status >= 400 && !shouldSkipApiFailureLog(request.url)) {
      let explicitTag: string | undefined;
      if ('getHandler' in host && 'getClass' in host) {
        const executionContext = host as ExecutionContext;
        const handler = executionContext.getHandler();
        const controllerClass = executionContext.getClass();
        if (
          typeof handler === 'function' &&
          typeof controllerClass === 'function'
        ) {
          explicitTag = this.reflector.getAllAndOverride<string>(
            API_FAILURE_TAG_KEY,
            [handler, controllerClass],
          );
        }
      }
      const correlationId =
        (typeof request.headers[CORRELATION_ID_HEADER] === 'string'
          ? request.headers[CORRELATION_ID_HEADER]
          : undefined) ??
        (typeof request.headers[REQUEST_ID_HEADER] === 'string'
          ? request.headers[REQUEST_ID_HEADER]
          : undefined);

      this.failureLogger.recordFailureSafe({
        tag: resolveApiFailureTag(request.url, explicitTag),
        method: request.method,
        path: request.url,
        statusCode: status,
        responseBody: normalizedBody,
        requestBody: request.body,
        userId: (request.user as JwtPayloadUser | undefined)?.sub ?? null,
        correlationId: correlationId ?? null,
        ipAddress: request.ip ?? null,
      });
    }

    httpAdapter.reply(response, normalizedBody, status);
  }
}
