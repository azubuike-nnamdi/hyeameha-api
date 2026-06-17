import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import { Airline } from './entities/airline.entity';

@Injectable()
export class AirlinesService {
  constructor(
    @InjectRepository(Airline)
    private readonly airlinesRepository: Repository<Airline>,
  ) {}

  async create(dto: CreateAirlineDto, userId: string): Promise<Airline> {
    await this.assertUniqueName(dto.name);

    const entity = this.airlinesRepository.create({
      name: dto.name,
      code: dto.code ?? null,
      isActive: dto.isActive ?? true,
      updatedBy: userId,
    });
    return this.airlinesRepository.save(entity);
  }

  async findAll(activeOnly = false): Promise<Airline[]> {
    return this.airlinesRepository.find({
      where: activeOnly ? { isActive: true } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Airline> {
    const airline = await this.airlinesRepository.findOne({ where: { id } });
    if (!airline) {
      throw new NotFoundException('Airline not found');
    }
    return airline;
  }

  async findActiveForBooking(id: string): Promise<Airline> {
    const airline = await this.findOne(id);
    if (!airline.isActive) {
      throw new BadRequestException(
        'The selected airline is not available for booking',
      );
    }
    return airline;
  }

  async update(
    id: string,
    dto: UpdateAirlineDto,
    userId: string,
  ): Promise<Airline> {
    const airline = await this.findOne(id);
    const nextName = dto.name ?? airline.name;

    if (nextName !== airline.name) {
      await this.assertUniqueName(nextName, airline.id);
    }

    if (dto.name !== undefined) {
      airline.name = dto.name;
    }
    if (dto.code !== undefined) {
      airline.code = dto.code ?? null;
    }
    if (dto.isActive !== undefined) {
      airline.isActive = dto.isActive;
    }
    airline.updatedBy = userId;

    return this.airlinesRepository.save(airline);
  }

  async remove(id: string): Promise<void> {
    const result = await this.airlinesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Airline not found');
    }
  }

  private async assertUniqueName(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.airlinesRepository.findOne({
      where: { name },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`An airline named "${name}" already exists`);
    }
  }
}
