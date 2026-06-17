import { RideBooking } from '../entities/ride-booking.entity';
import { RideBookingResponseDto } from '../dto/ride-booking-response.dto';
import { toRideResponseDto } from './ride.mapper';

export function toRideBookingResponseDto(
  booking: RideBooking,
): RideBookingResponseDto {
  return {
    id: booking.id,
    bookedByUserId: booking.bookedByUserId,
    isBookingForSelf: booking.isBookingForSelf,
    guestFirstName: booking.guestFirstName,
    guestLastName: booking.guestLastName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    pickupLocation: booking.pickupLocation,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    dropoffLocation: booking.dropoffLocation,
    rideId: booking.rideId,
    ride: toRideResponseDto(booking.ride),
    numberOfDays: booking.numberOfDays,
    passengerCount: booking.passengerCount,
    price: booking.price,
    driverNote: booking.driverNote,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}
