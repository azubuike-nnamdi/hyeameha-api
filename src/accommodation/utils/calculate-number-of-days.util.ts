/** Whole-day difference between check-out and check-in (minimum 0). */
export function calculateNumberOfDays(
  checkInDate: string,
  checkOutDate: string,
): number {
  const start = Date.parse(`${checkInDate}T00:00:00.000Z`);
  const end = Date.parse(`${checkOutDate}T00:00:00.000Z`);
  const diffMs = end - start;
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}
