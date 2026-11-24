import { SetMetadata } from '@nestjs/common';

export const AUTH_THROTTLE_KEY = 'authThrottle';

/**
 * Applies the strict `auth` rate limit (THROTTLE_AUTH_LIMIT per THROTTLE_AUTH_TTL seconds)
 * on top of the default limit. Use on credential, OTP, and email-sending endpoints.
 */
export const AuthThrottle = () => SetMetadata(AUTH_THROTTLE_KEY, true);
