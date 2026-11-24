/** Aligns with registration and e2e: 9+ chars, uppercase, digit, special character. */
export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/;

export const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 9 characters and include at least one uppercase letter, one digit, and one special character.';

/** bcrypt ignores input past 72 bytes; reject longer passwords instead of truncating silently. */
export const PASSWORD_MAX_LENGTH = 72;
