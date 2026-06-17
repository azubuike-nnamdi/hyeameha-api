import { BadRequestException } from '@nestjs/common';
import {
  calculateAirportPickupPrice,
  assertValidPassengerCount,
} from './calculate-airport-pickup-price.util';

describe('calculateAirportPickupPrice', () => {
  it('returns base price for one passenger', () => {
    expect(calculateAirportPickupPrice(1)).toBe('150.00');
  });

  it('adds extra passenger surcharge', () => {
    expect(calculateAirportPickupPrice(2)).toBe('200.00');
    expect(calculateAirportPickupPrice(3)).toBe('250.00');
  });

  it('supports maximum passenger count', () => {
    expect(calculateAirportPickupPrice(8)).toBe('500.00');
  });
});

describe('assertValidPassengerCount', () => {
  it('throws for values below minimum', () => {
    expect(() => assertValidPassengerCount(0)).toThrow(BadRequestException);
  });

  it('throws for values above maximum', () => {
    expect(() => assertValidPassengerCount(9)).toThrow(BadRequestException);
  });

  it('throws for non-integers', () => {
    expect(() => assertValidPassengerCount(2.5)).toThrow(BadRequestException);
  });
});
