import { BadRequestException } from '@nestjs/common';
import {
  AIRPORT_PICKUP_BASE_PRICE_GHS,
  AIRPORT_PICKUP_PRICE_PER_EXTRA_PASSENGER_GHS,
} from '../constants/airport-pickup-pricing';
import {
  MAX_AIRPORT_PICKUP_PASSENGERS,
  MIN_AIRPORT_PICKUP_PASSENGERS,
} from '../constants/airport-pickup-passengers';

export function calculateAirportPickupPrice(passengerCount: number): string {
  assertValidPassengerCount(passengerCount);

  const extraPassengers = Math.max(0, passengerCount - 1);
  const total =
    AIRPORT_PICKUP_BASE_PRICE_GHS +
    extraPassengers * AIRPORT_PICKUP_PRICE_PER_EXTRA_PASSENGER_GHS;

  return total.toFixed(2);
}

export function assertValidPassengerCount(passengerCount: number): void {
  if (
    !Number.isInteger(passengerCount) ||
    passengerCount < MIN_AIRPORT_PICKUP_PASSENGERS ||
    passengerCount > MAX_AIRPORT_PICKUP_PASSENGERS
  ) {
    throw new BadRequestException(
      `passengerCount must be an integer between ${MIN_AIRPORT_PICKUP_PASSENGERS} and ${MAX_AIRPORT_PICKUP_PASSENGERS}`,
    );
  }
}
