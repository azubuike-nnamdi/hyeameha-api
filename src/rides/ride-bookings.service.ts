import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { RIDE_BOOKING_ADMIN_ROLES } from '../users/constants/user-role';
import { CalculateRidePriceDto } from './dto/calculate-ride-price.dto';
import { CreateRideBookingDto } from './dto/create-ride-booking.dto';
import { RidePriceResponseDto } from './dto/ride-price-response.dto';
import { RideBooking } from './entities/ride-booking.entity';
import { RidesService } from './rides.service';
import {
  assertPassengerCountWithinCapacity,
  assertValidNumberOfDays,
  calculateRidePrice,
} from './utils/calculate-ride-price.util';

@Injectable()
export class RideBookingsService {
  constructor(
    @InjectRepository(RideBooking)
    private readonly bookingsRepository: Repository<RideBooking>,
    private readonly ridesService: RidesService,
  ) {}

  async calculatePrice(
    dto: CalculateRidePriceDto,
  ): Promise<RidePriceResponseDto> {
    const ride = await this.ridesService.findActiveForBooking(dto.rideId);
    assertValidNumberOfDays(dto.numberOfDays);

    return {
      price: calculateRidePrice(ride.pricePerDay, dto.numberOfDays),
      currency: 'GHS',
      pricePerDay: ride.pricePerDay,
      numberOfDays: dto.numberOfDays,
    };
  }

  async create(
    dto: CreateRideBookingDto,
    current: JwtPayloadUser,
  ): Promise<RideBooking> {
    const ride = await this.ridesService.findActiveForBooking(dto.rideId);
    assertValidNumberOfDays(dto.numberOfDays);
    assertPassengerCountWithinCapacity(dto.passengerCount, ride.maxPassengers);

    const price = calculateRidePrice(ride.pricePerDay, dto.numberOfDays);

    const entity = this.bookingsRepository.create({
      bookedByUserId: current.sub,
      isBookingForSelf: dto.isBookingForSelf,
      guestFirstName: dto.isBookingForSelf
        ? null
        : (dto.guestFirstName ?? null),
      guestLastName: dto.isBookingForSelf ? null : (dto.guestLastName ?? null),
      guestEmail: dto.isBookingForSelf ? null : (dto.guestEmail ?? null),
      guestPhone: dto.isBookingForSelf ? null : (dto.guestPhone ?? null),
      pickupLocation: dto.pickupLocation,
      pickupDate: dto.pickupDate,
      pickupTime: dto.pickupTime,
      dropoffLocation: dto.dropoffLocation,
      rideId: dto.rideId,
      numberOfDays: dto.numberOfDays,
      passengerCount: dto.passengerCount,
      price,
      driverNote: dto.driverNote ?? null,
    });

    const saved = await this.bookingsRepository.save(entity);
    return this.findEntityById(saved.id);
  }

  async findAll(current: JwtPayloadUser): Promise<RideBooking[]> {
    const isAdmin = RIDE_BOOKING_ADMIN_ROLES.includes(current.role);
    return this.bookingsRepository.find({
      where: isAdmin ? {} : { bookedByUserId: current.sub },
      relations: { ride: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, current: JwtPayloadUser): Promise<RideBooking> {
    const booking = await this.findEntityById(id);
    this.assertCanAccessBooking(booking, current);
    return booking;
  }

  private async findEntityById(id: string): Promise<RideBooking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: { ride: true },
    });
    if (!booking) {
      throw new NotFoundException('Ride booking not found');
    }
    return booking;
  }

  private assertCanAccessBooking(
    booking: RideBooking,
    current: JwtPayloadUser,
  ): void {
    const isAdmin = RIDE_BOOKING_ADMIN_ROLES.includes(current.role);
    if (!isAdmin && booking.bookedByUserId !== current.sub) {
      throw new ForbiddenException('You can only view your own bookings');
    }
  }
}
