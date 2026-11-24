import { Transform } from 'class-transformer';

/** Canonical form used for storage and lookup: trimmed and lower-cased. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** DTO decorator: normalizes string emails before validation runs. */
export const NormalizeEmail = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeEmail(value) : value,
  );
