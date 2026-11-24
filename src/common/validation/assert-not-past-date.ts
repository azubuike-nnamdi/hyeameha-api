import { BadRequestException } from '@nestjs/common';

/** Today's calendar date in UTC (Ghana time), as `YYYY-MM-DD`. */
export function todayUtcDateString(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Rejects `YYYY-MM-DD` dates before today (UTC). Today itself is allowed. */
export function assertNotPastDate(
  date: string,
  field: string,
  now = new Date(),
): void {
  if (date < todayUtcDateString(now)) {
    throw new BadRequestException(`${field} cannot be in the past`);
  }
}
