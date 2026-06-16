import { AccommodationBudget } from '../entities/accommodation-budget.entity';
import { AccommodationBudgetResponseDto } from '../dto/accommodation-budget-response.dto';

export function toAccommodationBudgetResponseDto(
  budget: AccommodationBudget,
): AccommodationBudgetResponseDto {
  return {
    id: budget.id,
    name: budget.name,
    minPrice: budget.minPrice,
    maxPrice: budget.maxPrice,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
    updatedBy: budget.updatedBy,
  };
}
