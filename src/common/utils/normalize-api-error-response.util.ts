import type { ApiDataResponse } from './api-response.util';

type HttpExceptionResponseBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export function normalizeApiErrorResponse(
  status: number,
  responseBody: string | HttpExceptionResponseBody,
): ApiDataResponse<Record<string, unknown> | null> {
  if (typeof responseBody === 'string') {
    return { statusCode: status, message: responseBody, data: null };
  }

  if (Array.isArray(responseBody.message)) {
    return {
      statusCode: status,
      message: 'Validation failed',
      data: { errors: responseBody.message },
    };
  }

  const message =
    typeof responseBody.message === 'string'
      ? responseBody.message
      : (responseBody.error ?? 'Request failed');

  return { statusCode: status, message, data: null };
}
