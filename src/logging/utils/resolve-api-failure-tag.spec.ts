import {
  resolveApiFailureTag,
  sanitizeRequestBody,
  shouldSkipApiFailureLog,
} from './resolve-api-failure-tag';

describe('resolveApiFailureTag', () => {
  it('uses explicit tag when provided', () => {
    expect(resolveApiFailureTag('/api/v1/auth/login', 'login')).toBe('login');
  });

  it('infers auth action from path', () => {
    expect(resolveApiFailureTag('/api/v1/auth/register')).toBe('register');
  });

  it('infers top-level resource tag', () => {
    expect(resolveApiFailureTag('/api/v1/events/abc')).toBe('events');
  });

  it('skips health and docs', () => {
    expect(shouldSkipApiFailureLog('/health')).toBe(true);
    expect(shouldSkipApiFailureLog('/docs')).toBe(true);
    expect(shouldSkipApiFailureLog('/api/v1/auth/login')).toBe(false);
  });
});

describe('sanitizeRequestBody', () => {
  it('redacts sensitive fields', () => {
    expect(
      sanitizeRequestBody({
        email: 'a@b.com',
        password: 'secret',
        otp: '123456',
      }),
    ).toEqual({
      email: 'a@b.com',
      password: '[REDACTED]',
      otp: '[REDACTED]',
    });
  });
});
