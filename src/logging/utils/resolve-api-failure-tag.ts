/** Paths that never write to `api_failure_logs`. */
const SKIPPED_PATH_PREFIXES = ['/health', '/docs', '/docs-json'];

/**
 * Request-body keys whose values are never persisted. Matched case-insensitively at any
 * depth: credentials, tokens, OTPs, payment data, and contact details of third parties.
 */
const SENSITIVE_KEY_PATTERN =
  /pass(word)?|token|otp|secret|authorization|api[-_]?key|card|cvv|cvc|pin$|phone|guestemail/i;

const MAX_SANITIZE_DEPTH = 6;
const MAX_STRING_LENGTH = 1000;

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
  return sanitizeValue(body, 0) as Record<string, unknown>;
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (depth > MAX_SANITIZE_DEPTH) {
    return '[TRUNCATED]';
  }
  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…`
      : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }
  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(
      value as Record<string, unknown>,
    )) {
      sanitized[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? '[REDACTED]'
        : sanitizeValue(child, depth + 1);
    }
    return sanitized;
  }
  return value;
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
