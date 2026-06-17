import { BadRequestException } from '@nestjs/common';
import {
  assertPassengerCountWithinCapacity,
  assertValidNumberOfDays,
  calculateRidePrice,
} from './calculate-ride-price.util';

describe('calculateRidePrice', () => {
  it('multiplies daily rate by number of days', () => {
    expect(calculateRidePrice('500.00', 3)).toBe('1500.00');
    expect(calculateRidePrice(250, 2)).toBe('500.00');
  });

  it('throws for invalid number of days', () => {
    expect(() => calculateRidePrice('500.00', 0)).toThrow(BadRequestException);
    expect(() => calculateRidePrice('500.00', 366)).toThrow(
      BadRequestException,
    );
  });
});

describe('assertValidNumberOfDays', () => {
  it('accepts valid day counts', () => {
    expect(() => assertValidNumberOfDays(1)).not.toThrow();
    expect(() => assertValidNumberOfDays(365)).not.toThrow();
  });
});

describe('assertPassengerCountWithinCapacity', () => {
  it('throws when passenger count exceeds vehicle capacity', () => {
    expect(() => assertPassengerCountWithinCapacity(4, 3)).toThrow(
      BadRequestException,
    );
  });

  it('accepts passenger count within capacity', () => {
    expect(() => assertPassengerCountWithinCapacity(3, 3)).not.toThrow();
  });
});
