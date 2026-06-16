import { AccommodationBooking } from '../entities/accommodation-booking.entity';
import { AccommodationBookingResponseDto } from '../dto/accommodation-booking-response.dto';
import { toAccommodationBudgetResponseDto } from './accommodation-budget.mapper';

export function toAccommodationBookingResponseDto(
  booking: AccommodationBooking,
): AccommodationBookingResponseDto {
  return {
    id: booking.id,
    bookedByUserId: booking.bookedByUserId,
    isBookingForSelf: booking.isBookingForSelf,
    guestFirstName: booking.guestFirstName,
    guestLastName: booking.guestLastName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    accommodationType: booking.accommodationType,
    budgetId: booking.budgetId,
    budget: toAccommodationBudgetResponseDto(booking.budget),
    location: booking.location,
    checkInDate: booking.checkInDate,
    checkInTime: booking.checkInTime,
    checkOutDate: booking.checkOutDate,
    numberOfDays: booking.numberOfDays,
    additionalInfo: booking.additionalInfo,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}
