import { BadRequestException } from '@nestjs/common';
import {
  MAX_RIDE_BOOKING_DAYS,
  MIN_RIDE_BOOKING_DAYS,
} from '../constants/ride-booking-days';

export function calculateRidePrice(
  pricePerDay: string | number,
  numberOfDays: number,
): string {
  assertValidNumberOfDays(numberOfDays);

  const dailyRate = Number(pricePerDay);
  const total = dailyRate * numberOfDays;

  return total.toFixed(2);
}

export function assertValidNumberOfDays(numberOfDays: number): void {
  if (
    !Number.isInteger(numberOfDays) ||
    numberOfDays < MIN_RIDE_BOOKING_DAYS ||
    numberOfDays > MAX_RIDE_BOOKING_DAYS
  ) {
    throw new BadRequestException(
      `numberOfDays must be an integer between ${MIN_RIDE_BOOKING_DAYS} and ${MAX_RIDE_BOOKING_DAYS}`,
    );
  }
}

export function assertPassengerCountWithinCapacity(
  passengerCount: number,
  maxPassengers: number,
): void {
  if (!Number.isInteger(passengerCount) || passengerCount < 1) {
    throw new BadRequestException('passengerCount must be at least 1');
  }

  if (passengerCount > maxPassengers) {
    throw new BadRequestException(
      `passengerCount cannot exceed the vehicle maximum of ${maxPassengers}`,
    );
  }
}
