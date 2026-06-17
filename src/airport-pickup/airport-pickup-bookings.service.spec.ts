import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { AirportPickupBookingsService } from './airport-pickup-bookings.service';
import { AirlinesService } from './airlines.service';
import { AirportPickupBooking } from './entities/airport-pickup-booking.entity';

describe('AirportPickupBookingsService', () => {
  let service: AirportPickupBookingsService;

  const bookingsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const airlinesService = {
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
    pickupLocation: 'Kotoka International Airport (Accra)',
    dropoffLocation: 'East Legon',
    passengerCount: 2,
    airlineId: 'airline-1',
    airline: {
      id: 'airline-1',
      name: 'Ethiopian Airlines',
      code: 'ET',
      isActive: true,
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    arrivalTime: '14:30',
    pickupDate: '2026-06-17',
    pickupTime: '08:33',
    price: '200.00',
    additionalNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as AirportPickupBooking;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirportPickupBookingsService,
        {
          provide: getRepositoryToken(AirportPickupBooking),
          useValue: bookingsRepository,
        },
        { provide: AirlinesService, useValue: airlinesService },
      ],
    }).compile();

    service = module.get(AirportPickupBookingsService);
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
    it('returns calculated price for passenger count', () => {
      const result = service.calculatePrice({ passengerCount: 2 });
      expect(result).toEqual({
        price: '200.00',
        currency: 'GHS',
        passengerCount: 2,
      });
    });
  });

  describe('findAll', () => {
    it('returns only the current user bookings for regular users', async () => {
      bookingsRepository.find.mockResolvedValue([booking]);

      const result = await service.findAll(userJwt);

      expect(bookingsRepository.find).toHaveBeenCalledWith({
        where: { bookedByUserId: 'user-1' },
        relations: { airline: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([booking]);
    });

    it('returns all bookings for admin', async () => {
      bookingsRepository.find.mockResolvedValue([booking]);

      await service.findAll(adminJwt);

      expect(bookingsRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: { airline: true },
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
