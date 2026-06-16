import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccommodationBudgetDto } from './dto/create-accommodation-budget.dto';
import { UpdateAccommodationBudgetDto } from './dto/update-accommodation-budget.dto';
import { AccommodationBudget } from './entities/accommodation-budget.entity';

@Injectable()
export class AccommodationBudgetsService {
  constructor(
    @InjectRepository(AccommodationBudget)
    private readonly budgetsRepository: Repository<AccommodationBudget>,
  ) {}

  async create(
    dto: CreateAccommodationBudgetDto,
    userId: string,
  ): Promise<AccommodationBudget> {
    this.assertValidPriceRange(dto.minPrice, dto.maxPrice);
    const entity = this.budgetsRepository.create({
      name: dto.name,
      minPrice: dto.minPrice.toFixed(2),
      maxPrice: dto.maxPrice.toFixed(2),
      updatedBy: userId,
    });
    return this.budgetsRepository.save(entity);
  }

  async findAll(): Promise<AccommodationBudget[]> {
    return this.budgetsRepository.find({ order: { minPrice: 'ASC' } });
  }

  async findOne(id: string): Promise<AccommodationBudget> {
    const budget = await this.budgetsRepository.findOne({ where: { id } });
    if (!budget) {
      throw new NotFoundException('Accommodation budget not found');
    }
    return budget;
  }

  async update(
    id: string,
    dto: UpdateAccommodationBudgetDto,
    userId: string,
  ): Promise<AccommodationBudget> {
    const budget = await this.findOne(id);
    const minPrice =
      dto.minPrice !== undefined ? dto.minPrice : Number(budget.minPrice);
    const maxPrice =
      dto.maxPrice !== undefined ? dto.maxPrice : Number(budget.maxPrice);
    this.assertValidPriceRange(minPrice, maxPrice);

    if (dto.name !== undefined) {
      budget.name = dto.name;
    }
    if (dto.minPrice !== undefined) {
      budget.minPrice = dto.minPrice.toFixed(2);
    }
    if (dto.maxPrice !== undefined) {
      budget.maxPrice = dto.maxPrice.toFixed(2);
    }
    budget.updatedBy = userId;

    return this.budgetsRepository.save(budget);
  }

  async remove(id: string): Promise<void> {
    const result = await this.budgetsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Accommodation budget not found');
    }
  }

  private assertValidPriceRange(minPrice: number, maxPrice: number): void {
    if (maxPrice < minPrice) {
      throw new BadRequestException(
        'maxPrice must be greater than or equal to minPrice',
      );
    }
  }
}
