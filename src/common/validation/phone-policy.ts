/**
 * Subscriber number as digits only (no +, spaces, dashes, or letters).
 * 7–15 digits covers typical international lengths without requiring a specific format.
 */
export const PHONE_DIGITS_ONLY_PATTERN = /^\d{7,15}$/;

export const PHONE_DIGITS_ONLY_MESSAGE =
  'phone must be 7–15 digits only (no +, spaces, or symbols)';
