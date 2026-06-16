import { calculateNumberOfDays } from './calculate-number-of-days.util';

describe('calculateNumberOfDays', () => {
  it('returns 0 for same-day stays', () => {
    expect(calculateNumberOfDays('2026-06-16', '2026-06-16')).toBe(0);
  });

  it('returns whole-day difference between dates', () => {
    expect(calculateNumberOfDays('2026-06-16', '2026-06-20')).toBe(4);
  });

  it('never returns negative values', () => {
    expect(calculateNumberOfDays('2026-06-20', '2026-06-16')).toBe(0);
  });
});
