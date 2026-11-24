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

  it('redacts nested sensitive fields and third-party contact details', () => {
    expect(
      sanitizeRequestBody({
        guestEmail: 'g@b.com',
        guestPhone: '15551234567',
        payment: { cardNumber: '4111', cvv: '123', amount: 10 },
        items: [{ refreshToken: 'x', qty: 1 }],
      }),
    ).toEqual({
      guestEmail: '[REDACTED]',
      guestPhone: '[REDACTED]',
      payment: { cardNumber: '[REDACTED]', cvv: '[REDACTED]', amount: 10 },
      items: [{ refreshToken: '[REDACTED]', qty: 1 }],
    });
  });

  it('truncates very long strings', () => {
    const result = sanitizeRequestBody({ note: 'a'.repeat(2000) });
    expect((result?.note as string).length).toBeLessThan(1100);
  });
});
