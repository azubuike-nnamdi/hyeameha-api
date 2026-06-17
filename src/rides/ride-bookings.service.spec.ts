import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { RideBookingsService } from './ride-bookings.service';
import { RidesService } from './rides.service';
import { RideBooking } from './entities/ride-booking.entity';

describe('RideBookingsService', () => {
  let service: RideBookingsService;

  const bookingsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const ridesService = {
    findActiveForBooking: jest.fn(),
  };

  const booking = {
    id: 'booking-1',
    bookedByUserId: 'user-1',
    isBookingForSelf: true,
    guestFirstName: null,
    guestLastName: null,
    guestEmail: null,
    guestPhone: null,
    pickupLocation: 'Accra Mall',
    pickupDate: '2026-06-17',
    pickupTime: '09:00',
    dropoffLocation: 'Kumasi Central',
    rideId: 'ride-1',
    ride: {
      id: 'ride-1',
      vehicleType: 'saloon',
      serviceTier: 'regular',
      maxPassengers: 3,
      maxLuggage: 2,
      description: 'Modern saloon',
      imageUrl: 'https://example.com/saloon.jpg',
      pricePerDay: '500.00',
      isActive: true,
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    numberOfDays: 3,
    passengerCount: 2,
    price: '1500.00',
    driverNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as RideBooking;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RideBookingsService,
        {
          provide: getRepositoryToken(RideBooking),
          useValue: bookingsRepository,
        },
        { provide: RidesService, useValue: ridesService },
      ],
    }).compile();

    service = module.get(RideBookingsService);
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

  describe('calculatePrice', () => {
    it('returns calculated price from ride daily rate', async () => {
      ridesService.findActiveForBooking.mockResolvedValue(booking.ride);

      const result = await service.calculatePrice({
        rideId: 'ride-1',
        numberOfDays: 3,
      });

      expect(result).toEqual({
        price: '1500.00',
        currency: 'GHS',
        pricePerDay: '500.00',
        numberOfDays: 3,
      });
    });
  });

  describe('findAll', () => {
    it('returns only the current user bookings for regular users', async () => {
      bookingsRepository.find.mockResolvedValue([booking]);

      const result = await service.findAll(userJwt);

      expect(bookingsRepository.find).toHaveBeenCalledWith({
        where: { bookedByUserId: 'user-1' },
        relations: { ride: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([booking]);
    });

    it('returns all bookings for admin', async () => {
      bookingsRepository.find.mockResolvedValue([booking]);

      await service.findAll(adminJwt);

      expect(bookingsRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: { ride: true },
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

    it('throws when the booking does not exist', async () => {
      bookingsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing', adminJwt)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
