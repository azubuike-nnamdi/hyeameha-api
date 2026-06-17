import { AirportPickupBooking } from '../entities/airport-pickup-booking.entity';
import { AirportPickupBookingResponseDto } from '../dto/airport-pickup-booking-response.dto';
import { toAirlineResponseDto } from './airline.mapper';

export function toAirportPickupBookingResponseDto(
  booking: AirportPickupBooking,
): AirportPickupBookingResponseDto {
  return {
    id: booking.id,
    bookedByUserId: booking.bookedByUserId,
    isBookingForSelf: booking.isBookingForSelf,
    guestFirstName: booking.guestFirstName,
    guestLastName: booking.guestLastName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    passengerCount: booking.passengerCount,
    airlineId: booking.airlineId,
    airline: toAirlineResponseDto(booking.airline),
    arrivalTime: booking.arrivalTime,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    price: booking.price,
    additionalNote: booking.additionalNote,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}
