import { Test, TestingModule } from '@nestjs/testing';
import { AccommodationBookingsController } from './accommodation-bookings.controller';
import { AccommodationBookingsService } from './accommodation-bookings.service';

describe('AccommodationBookingsController', () => {
  let controller: AccommodationBookingsController;

  const bookingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccommodationBookingsController],
      providers: [
        { provide: AccommodationBookingsService, useValue: bookingsService },
      ],
    }).compile();

    controller = module.get(AccommodationBookingsController);
  });

  const userJwt = {
    sub: 'user-1',
    email: 'user@example.com',
    role: 'user' as const,
  };

  it('passes the current user to findAll', async () => {
    bookingsService.findAll.mockResolvedValue([]);
    await controller.findAll(userJwt);
    expect(bookingsService.findAll).toHaveBeenCalledWith(userJwt);
  });

  it('passes the current user to findOne', async () => {
    bookingsService.findOne.mockResolvedValue({
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
    });
    await controller.findOne('booking-1', userJwt);
    expect(bookingsService.findOne).toHaveBeenCalledWith('booking-1', userJwt);
  });
});
