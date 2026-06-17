import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { AIRPORT_PICKUP_BOOKING_ADMIN_ROLES } from '../users/constants/user-role';
import { CalculateAirportPickupPriceDto } from './dto/calculate-airport-pickup-price.dto';
import { CreateAirportPickupBookingDto } from './dto/create-airport-pickup-booking.dto';
import { AirportPickupPriceResponseDto } from './dto/airport-pickup-price-response.dto';
import { AirportPickupBooking } from './entities/airport-pickup-booking.entity';
import { AirlinesService } from './airlines.service';
import { calculateAirportPickupPrice } from './utils/calculate-airport-pickup-price.util';

@Injectable()
export class AirportPickupBookingsService {
  constructor(
    @InjectRepository(AirportPickupBooking)
    private readonly bookingsRepository: Repository<AirportPickupBooking>,
    private readonly airlinesService: AirlinesService,
  ) {}

  calculatePrice(
    dto: CalculateAirportPickupPriceDto,
  ): AirportPickupPriceResponseDto {
    return {
      price: calculateAirportPickupPrice(dto.passengerCount),
      currency: 'GHS',
      passengerCount: dto.passengerCount,
    };
  }

  async create(
    dto: CreateAirportPickupBookingDto,
    current: JwtPayloadUser,
  ): Promise<AirportPickupBooking> {
    await this.airlinesService.findActiveForBooking(dto.airlineId);
    const price = calculateAirportPickupPrice(dto.passengerCount);

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
      dropoffLocation: dto.dropoffLocation,
      passengerCount: dto.passengerCount,
      airlineId: dto.airlineId,
      arrivalTime: dto.arrivalTime,
      pickupDate: dto.pickupDate,
      pickupTime: dto.pickupTime,
      price,
      additionalNote: dto.additionalNote ?? null,
    });

    const saved = await this.bookingsRepository.save(entity);
    return this.findEntityById(saved.id);
  }

  async findAll(current: JwtPayloadUser): Promise<AirportPickupBooking[]> {
    const isAdmin = AIRPORT_PICKUP_BOOKING_ADMIN_ROLES.includes(current.role);
    return this.bookingsRepository.find({
      where: isAdmin ? {} : { bookedByUserId: current.sub },
      relations: { airline: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    id: string,
    current: JwtPayloadUser,
  ): Promise<AirportPickupBooking> {
    const booking = await this.findEntityById(id);
    this.assertCanAccessBooking(booking, current);
    return booking;
  }

  private async findEntityById(id: string): Promise<AirportPickupBooking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: { airline: true },
    });
    if (!booking) {
      throw new NotFoundException('Airport pickup booking not found');
    }
    return booking;
  }

  private assertCanAccessBooking(
    booking: AirportPickupBooking,
    current: JwtPayloadUser,
  ): void {
    const isAdmin = AIRPORT_PICKUP_BOOKING_ADMIN_ROLES.includes(current.role);
    if (!isAdmin && booking.bookedByUserId !== current.sub) {
      throw new ForbiddenException('You can only view your own bookings');
    }
  }
}
