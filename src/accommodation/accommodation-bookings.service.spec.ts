import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { AccommodationBookingsService } from './accommodation-bookings.service';
import { AccommodationBudgetsService } from './accommodation-budgets.service';
import { AccommodationBooking } from './entities/accommodation-booking.entity';

describe('AccommodationBookingsService', () => {
  let service: AccommodationBookingsService;

  const bookingsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const budgetsService = {
    findOne: jest.fn(),
    assertAccommodationTypeMatchesBudget: jest.fn(),
  };

  const booking = {
    id: 'booking-1',
    bookedByUserId: 'user-1',
    isBookingForSelf: true,
    guestFirstName: null,
    guestLastName: null,
    guestEmail: null,
    guestPhone: null,
    accommodationType: 'hotel',
    budgetId: 'budget-1',
    budget: {
      id: 'budget-1',
      name: 'Standard',
      accommodationType: 'hotel',
      minPrice: 100,
      maxPrice: 200,
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    location: 'Lagos',
    checkInDate: '2026-07-01',
    checkInTime: '14:00',
    checkOutDate: '2026-07-03',
    numberOfDays: 2,
    additionalInfo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as AccommodationBooking;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccommodationBookingsService,
        {
          provide: getRepositoryToken(AccommodationBooking),
          useValue: bookingsRepository,
        },
        { provide: AccommodationBudgetsService, useValue: budgetsService },
      ],
    }).compile();

    service = module.get(AccommodationBookingsService);
  });

  const userJwt: JwtPayloadUser = {
    sub: 'user-1',
    email: 'user@example.com',
    role: 'user',
  };

  const otherUserJwt: JwtPayloadUser = {
    sub: 'user-2',
    email: 'other@example.com',
    role: 'user',
  };

  const adminJwt: JwtPayloadUser = {
    sub: 'admin-1',
    email: 'admin@example.com',
    role: 'admin',
  };

  const superAdminJwt: JwtPayloadUser = {
    sub: 'super-1',
    email: 'super@example.com',
    role: 'super_admin',
  };

  describe('findAll', () => {
    it('returns only the current user bookings for regular users', async () => {
      bookingsRepository.find.mockResolvedValue([booking]);

      const result = await service.findAll(userJwt);

      expect(bookingsRepository.find).toHaveBeenCalledWith({
        where: { bookedByUserId: 'user-1' },
        relations: { budget: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([booking]);
    });

    it('returns all bookings for admin', async () => {
      bookingsRepository.find.mockResolvedValue([booking]);

      await service.findAll(adminJwt);

      expect(bookingsRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: { budget: true },
        order: { createdAt: 'DESC' },
      });
    });

    it('returns all bookings for super_admin', async () => {
      bookingsRepository.find.mockResolvedValue([booking]);

      await service.findAll(superAdminJwt);

      expect(bookingsRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: { budget: true },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    beforeEach(() => {
      bookingsRepository.findOne.mockResolvedValue(booking);
    });

    it('allows the booking owner to view their booking', async () => {
      const result = await service.findOne('booking-1', userJwt);
      expect(result).toEqual(booking);
    });

    it('forbids another user from viewing the booking', async () => {
      await expect(
        service.findOne('booking-1', otherUserJwt),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('allows admin to view any booking', async () => {
      const result = await service.findOne('booking-1', adminJwt);
      expect(result).toEqual(booking);
    });

    it('allows super_admin to view any booking', async () => {
      const result = await service.findOne('booking-1', superAdminJwt);
      expect(result).toEqual(booking);
    });

    it('throws when the booking does not exist', async () => {
      bookingsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing', adminJwt)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
