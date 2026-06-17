import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AirlinesService } from './airlines.service';
import { Airline } from './entities/airline.entity';

describe('AirlinesService', () => {
  let service: AirlinesService;

  const airlinesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const airline = {
    id: 'airline-1',
    name: 'Ethiopian Airlines',
    code: 'ET',
    isActive: true,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Airline;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirlinesService,
        {
          provide: getRepositoryToken(Airline),
          useValue: airlinesRepository,
        },
      ],
    }).compile();

    service = module.get(AirlinesService);
  });

  describe('create', () => {
    it('creates an airline when name is unique', async () => {
      airlinesRepository.findOne.mockResolvedValue(null);
      airlinesRepository.create.mockReturnValue(airline);
      airlinesRepository.save.mockResolvedValue(airline);

      const result = await service.create(
        { name: 'Ethiopian Airlines', code: 'ET' },
        'admin-1',
      );

      expect(result).toEqual(airline);
      expect(airlinesRepository.create).toHaveBeenCalledWith({
        name: 'Ethiopian Airlines',
        code: 'ET',
        isActive: true,
        updatedBy: 'admin-1',
      });
    });

    it('throws when airline name already exists', async () => {
      airlinesRepository.findOne.mockResolvedValue(airline);

      await expect(
        service.create({ name: 'Ethiopian Airlines' }, 'admin-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findAll', () => {
    it('returns only active airlines by default filter', async () => {
      airlinesRepository.find.mockResolvedValue([airline]);

      await service.findAll(true);

      expect(airlinesRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('throws when airline does not exist', async () => {
      airlinesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('throws when airline does not exist', async () => {
      airlinesRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
