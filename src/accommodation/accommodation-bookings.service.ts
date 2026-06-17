import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { BOOKING_ADMIN_ROLES } from '../users/constants/user-role';
import { CreateAccommodationBookingDto } from './dto/create-accommodation-booking.dto';
import { AccommodationBooking } from './entities/accommodation-booking.entity';
import { AccommodationBudgetsService } from './accommodation-budgets.service';
import { calculateNumberOfDays } from './utils/calculate-number-of-days.util';

@Injectable()
export class AccommodationBookingsService {
  constructor(
    @InjectRepository(AccommodationBooking)
    private readonly bookingsRepository: Repository<AccommodationBooking>,
    private readonly budgetsService: AccommodationBudgetsService,
  ) {}

  async create(
    dto: CreateAccommodationBookingDto,
    current: JwtPayloadUser,
  ): Promise<AccommodationBooking> {
    this.assertValidStayDates(dto.checkInDate, dto.checkOutDate);
    const budget = await this.budgetsService.findOne(dto.budgetId);
    this.budgetsService.assertAccommodationTypeMatchesBudget(
      dto.accommodationType,
      budget,
    );

    const entity = this.bookingsRepository.create({
      bookedByUserId: current.sub,
      isBookingForSelf: dto.isBookingForSelf,
      guestFirstName: dto.isBookingForSelf
        ? null
        : (dto.guestFirstName ?? null),
      guestLastName: dto.isBookingForSelf ? null : (dto.guestLastName ?? null),
      guestEmail: dto.isBookingForSelf ? null : (dto.guestEmail ?? null),
      guestPhone: dto.isBookingForSelf ? null : (dto.guestPhone ?? null),
      accommodationType: dto.accommodationType,
      budgetId: dto.budgetId,
      location: dto.location,
      checkInDate: dto.checkInDate,
      checkInTime: dto.checkInTime,
      checkOutDate: dto.checkOutDate,
      numberOfDays: calculateNumberOfDays(dto.checkInDate, dto.checkOutDate),
      additionalInfo: dto.additionalInfo ?? null,
    });

    const saved = await this.bookingsRepository.save(entity);
    return this.findEntityById(saved.id);
  }

  async findAll(current: JwtPayloadUser): Promise<AccommodationBooking[]> {
    const isAdmin = BOOKING_ADMIN_ROLES.includes(current.role);
    return this.bookingsRepository.find({
      where: isAdmin ? {} : { bookedByUserId: current.sub },
      relations: { budget: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    id: string,
    current: JwtPayloadUser,
  ): Promise<AccommodationBooking> {
    const booking = await this.findEntityById(id);
    this.assertCanAccessBooking(booking, current);
    return booking;
  }

  private async findEntityById(id: string): Promise<AccommodationBooking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: { budget: true },
    });
    if (!booking) {
      throw new NotFoundException('Accommodation booking not found');
    }
    return booking;
  }

  private assertCanAccessBooking(
    booking: AccommodationBooking,
    current: JwtPayloadUser,
  ): void {
    const isAdmin = BOOKING_ADMIN_ROLES.includes(current.role);
    if (!isAdmin && booking.bookedByUserId !== current.sub) {
      throw new ForbiddenException('You can only view your own bookings');
    }
  }

  private assertValidStayDates(
    checkInDate: string,
    checkOutDate: string,
  ): void {
    if (checkOutDate < checkInDate) {
      throw new BadRequestException(
        'checkOutDate must be on or after checkInDate',
      );
    }
  }
}
