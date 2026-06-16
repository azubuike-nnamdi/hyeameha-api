import type { AccommodationBudget } from '../../accommodation/entities/accommodation-budget.entity';

export type AccommodationBudgetSeedRow = Pick<
  AccommodationBudget,
  'name' | 'minPrice' | 'maxPrice'
>;

export const DEFAULT_ACCOMMODATION_BUDGETS: AccommodationBudgetSeedRow[] = [
  { name: 'Standard', minPrice: '2.00', maxPrice: '3.00' },
  { name: 'Premium', minPrice: '200.00', maxPrice: '300.00' },
  { name: 'Luxury', minPrice: '300.00', maxPrice: '500.00' },
  { name: 'VIP', minPrice: '500.00', maxPrice: '2000.00' },
];

export const DEFAULT_ACCOMMODATION_BUDGET_NAMES =
  DEFAULT_ACCOMMODATION_BUDGETS.map((budget) => budget.name);
