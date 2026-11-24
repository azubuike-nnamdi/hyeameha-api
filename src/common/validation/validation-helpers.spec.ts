import { BadRequestException } from '@nestjs/common';
import { toPagination } from '../dto/pagination-query.dto';
import { assertNotPastDate, todayUtcDateString } from './assert-not-past-date';
import { normalizeEmail } from './normalize-email';

describe('normalizeEmail', () => {
  it('trims and lower-cases', () => {
    expect(normalizeEmail('  Jane.Doe@Example.COM ')).toBe(
      'jane.doe@example.com',
    );
  });
});

describe('assertNotPastDate', () => {
  const now = new Date('2026-11-24T23:30:00Z');

  it('allows today and future dates', () => {
    expect(todayUtcDateString(now)).toBe('2026-11-24');
    expect(() => assertNotPastDate('2026-11-24', 'd', now)).not.toThrow();
    expect(() => assertNotPastDate('2027-01-01', 'd', now)).not.toThrow();
  });

  it('rejects past dates', () => {
    expect(() => assertNotPastDate('2026-11-23', 'pickupDate', now)).toThrow(
      BadRequestException,
    );
  });
});

describe('toPagination', () => {
  it('defaults to the first page of 50', () => {
    expect(toPagination()).toEqual({ skip: 0, take: 50 });
  });

  it('converts page and limit to skip/take', () => {
    expect(toPagination({ page: 3, limit: 20 })).toEqual({
      skip: 40,
      take: 20,
    });
  });
});
