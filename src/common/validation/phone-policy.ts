/** E.164: leading +, country code, subscriber number (max 15 digits total). */
export const E164_PHONE_PATTERN = /^\+[1-9]\d{1,14}$/;

export const E164_PHONE_MESSAGE =
  'phone must be E.164 format (e.g. +15551234567)';
