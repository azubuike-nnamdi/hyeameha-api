import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';

describe('RidesService', () => {
  let service: RidesService;

  const ridesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const ride = {
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
  } as Ride;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RidesService,
        {
          provide: getRepositoryToken(Ride),
          useValue: ridesRepository,
        },
      ],
    }).compile();

    service = module.get(RidesService);
  });

  describe('create', () => {
    it('creates a ride when vehicle type and tier are unique', async () => {
      ridesRepository.findOne.mockResolvedValue(null);
      ridesRepository.create.mockReturnValue(ride);
      ridesRepository.save.mockResolvedValue(ride);

      const result = await service.create(
        {
          vehicleType: 'saloon',
          serviceTier: 'regular',
          maxPassengers: 3,
          maxLuggage: 2,
          description: 'Modern saloon',
          imageUrl: 'https://example.com/saloon.jpg',
          pricePerDay: 500,
        },
        'admin-1',
      );

      expect(result).toEqual(ride);
    });

    it('throws when vehicle type and tier combination already exists', async () => {
      ridesRepository.findOne.mockResolvedValue(ride);

      await expect(
        service.create(
          {
            vehicleType: 'saloon',
            serviceTier: 'regular',
            maxPassengers: 3,
            maxLuggage: 2,
            description: 'Modern saloon',
            imageUrl: 'https://example.com/saloon.jpg',
            pricePerDay: 500,
          },
          'admin-1',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findAll', () => {
    it('filters active rides by default', async () => {
      ridesRepository.find.mockResolvedValue([ride]);

      await service.findAll({ activeOnly: true });

      expect(ridesRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { vehicleType: 'ASC', serviceTier: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('throws when ride does not exist', async () => {
      ridesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
