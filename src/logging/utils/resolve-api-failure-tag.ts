/** Paths that never write to `api_failure_logs`. */
const SKIPPED_PATH_PREFIXES = ['/health', '/docs', '/docs-json'];

const SENSITIVE_REQUEST_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'refreshToken',
  'otp',
]);

export function shouldSkipApiFailureLog(path: string): boolean {
  const pathname = path.split('?')[0] ?? path;
  return SKIPPED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Resolves a searchable tag for DB failure logs.
 * Prefer explicit `@ApiFailureTag()`; otherwise infer from `/api/v1/{area}/{action}`.
 */
export function resolveApiFailureTag(
  path: string,
  explicitTag?: string,
): string {
  if (explicitTag?.trim()) {
    return explicitTag.trim();
  }

  const normalized = (path.split('?')[0] ?? path).replace(/^\/api\/v1\/?/, '');
  const segments = normalized.split('/').filter(Boolean);

  if (segments[0] === 'auth' && segments[1]) {
    return segments[1];
  }
  if (segments[0]) {
    return segments[0];
  }
  return 'unknown';
}

export function sanitizeRequestBody(
  body: unknown,
): Record<string, unknown> | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    sanitized[key] = SENSITIVE_REQUEST_KEYS.has(key) ? '[REDACTED]' : value;
  }
  return sanitized;
}

export function extractErrorMessage(responseBody: string | object): string {
  if (typeof responseBody === 'string') {
    return responseBody;
  }
  if (
    typeof responseBody === 'object' &&
    responseBody !== null &&
    'message' in responseBody
  ) {
    const { message } = responseBody;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message)) {
      return message.map(String).join('; ');
    }
  }
  return 'Request failed';
}

export function normalizeResponseBody(
  responseBody: string | object,
): Record<string, unknown> | null {
  if (typeof responseBody === 'string') {
    return { message: responseBody };
  }
  if (typeof responseBody === 'object' && responseBody !== null) {
    return responseBody as Record<string, unknown>;
  }
  return null;
}
