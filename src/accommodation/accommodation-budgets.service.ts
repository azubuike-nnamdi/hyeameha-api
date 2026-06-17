import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ACCOMMODATION_TYPES,
  type AccommodationType,
} from './constants/accommodation-type';
import { ACCOMMODATION_BUDGET_TIERS_BY_TYPE } from './constants/accommodation-budget-tiers-by-type';
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
    this.assertValidAccommodationType(dto.accommodationType);
    this.assertValidTierName(dto.accommodationType, dto.name);
    this.assertValidPricing(dto.minPrice, dto.maxPrice);
    await this.assertUniqueTier(dto.accommodationType, dto.name);

    const entity = this.budgetsRepository.create({
      accommodationType: dto.accommodationType,
      name: dto.name,
      minPrice: dto.minPrice.toFixed(2),
      maxPrice: this.normalizeMaxPrice(dto.minPrice, dto.maxPrice),
      updatedBy: userId,
    });
    return this.budgetsRepository.save(entity);
  }

  async findAll(
    accommodationType?: AccommodationType,
  ): Promise<AccommodationBudget[]> {
    if (accommodationType) {
      this.assertValidAccommodationType(accommodationType);
    }

    return this.budgetsRepository.find({
      where: accommodationType ? { accommodationType } : {},
      order: { accommodationType: 'ASC', minPrice: 'ASC', name: 'ASC' },
    });
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
    const nextAccommodationType =
      dto.accommodationType ?? budget.accommodationType;
    const nextName = dto.name ?? budget.name;
    const nextMinPrice =
      dto.minPrice !== undefined ? dto.minPrice : Number(budget.minPrice);
    const nextMaxPrice =
      dto.maxPrice !== undefined
        ? dto.maxPrice
        : budget.maxPrice === null
          ? null
          : Number(budget.maxPrice);

    this.assertValidAccommodationType(nextAccommodationType);
    this.assertValidTierName(nextAccommodationType, nextName);
    this.assertValidPricing(nextMinPrice, nextMaxPrice);

    if (
      nextAccommodationType !== budget.accommodationType ||
      nextName !== budget.name
    ) {
      await this.assertUniqueTier(nextAccommodationType, nextName, budget.id);
    }

    budget.accommodationType = nextAccommodationType;
    budget.name = nextName;
    budget.minPrice = nextMinPrice.toFixed(2);
    budget.maxPrice = this.normalizeMaxPrice(nextMinPrice, nextMaxPrice);
    budget.updatedBy = userId;

    return this.budgetsRepository.save(budget);
  }

  async remove(id: string): Promise<void> {
    const result = await this.budgetsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Accommodation budget not found');
    }
  }

  assertAccommodationTypeMatchesBudget(
    accommodationType: string,
    budget: AccommodationBudget,
  ): void {
    if (accommodationType !== budget.accommodationType) {
      throw new BadRequestException(
        `accommodationType must match the selected budget (${budget.accommodationType})`,
      );
    }
  }

  private assertValidAccommodationType(accommodationType: string): void {
    if (
      !(ACCOMMODATION_TYPES as readonly string[]).includes(accommodationType)
    ) {
      throw new BadRequestException(
        `accommodationType must be one of: ${ACCOMMODATION_TYPES.join(', ')}`,
      );
    }
  }

  private assertValidTierName(accommodationType: string, name: string): void {
    const allowedTiers =
      ACCOMMODATION_BUDGET_TIERS_BY_TYPE[
        accommodationType as AccommodationType
      ];
    if (!allowedTiers?.includes(name)) {
      throw new BadRequestException(
        `name must be one of: ${allowedTiers?.join(', ') ?? 'unknown'} for accommodation type "${accommodationType}"`,
      );
    }
  }

  private assertValidPricing(minPrice: number, maxPrice?: number | null): void {
    if (maxPrice === null || maxPrice === undefined) {
      return;
    }
    if (maxPrice < minPrice) {
      throw new BadRequestException(
        'maxPrice must be greater than or equal to minPrice',
      );
    }
  }

  private normalizeMaxPrice(
    minPrice: number,
    maxPrice?: number | null,
  ): string | null {
    if (maxPrice === null || maxPrice === undefined) {
      return null;
    }
    return maxPrice.toFixed(2);
  }

  private async assertUniqueTier(
    accommodationType: string,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.budgetsRepository.findOne({
      where: { accommodationType, name },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `A "${name}" budget already exists for accommodation type "${accommodationType}"`,
      );
    }
  }
}
