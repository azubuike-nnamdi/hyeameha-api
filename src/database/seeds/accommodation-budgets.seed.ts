import type { AccommodationBudget } from '../../accommodation/entities/accommodation-budget.entity';

export type AccommodationBudgetSeedRow = Pick<
  AccommodationBudget,
  'name' | 'accommodationType' | 'minPrice' | 'maxPrice'
>;

export const DEFAULT_ACCOMMODATION_BUDGETS: AccommodationBudgetSeedRow[] = [
  // Hotel — Standard, Premium, Luxury, VIP
  {
    accommodationType: 'hotel',
    name: 'Standard',
    minPrice: '80.00',
    maxPrice: '150.00',
  },
  {
    accommodationType: 'hotel',
    name: 'Premium',
    minPrice: '150.00',
    maxPrice: '300.00',
  },
  {
    accommodationType: 'hotel',
    name: 'Luxury',
    minPrice: '300.00',
    maxPrice: '600.00',
  },
  {
    accommodationType: 'hotel',
    name: 'VIP',
    minPrice: '600.00',
    maxPrice: '2000.00',
  },
  // Guesthouse — Economy, Standard, Premium, Luxury
  {
    accommodationType: 'guesthouse',
    name: 'Economy',
    minPrice: '30.00',
    maxPrice: '55.00',
  },
  {
    accommodationType: 'guesthouse',
    name: 'Standard',
    minPrice: '55.00',
    maxPrice: '90.00',
  },
  {
    accommodationType: 'guesthouse',
    name: 'Premium',
    minPrice: '90.00',
    maxPrice: '160.00',
  },
  {
    accommodationType: 'guesthouse',
    name: 'Luxury',
    minPrice: '160.00',
    maxPrice: '350.00',
  },
  // Apartment — Economy, Standard, Premium, Luxury
  {
    accommodationType: 'apartment',
    name: 'Economy',
    minPrice: '50.00',
    maxPrice: '100.00',
  },
  {
    accommodationType: 'apartment',
    name: 'Standard',
    minPrice: '100.00',
    maxPrice: '180.00',
  },
  {
    accommodationType: 'apartment',
    name: 'Premium',
    minPrice: '180.00',
    maxPrice: '350.00',
  },
  {
    accommodationType: 'apartment',
    name: 'Luxury',
    minPrice: '350.00',
    maxPrice: '800.00',
  },
  // Villa — Economy, Standard, Premium, Luxury
  {
    accommodationType: 'villa',
    name: 'Economy',
    minPrice: '200.00',
    maxPrice: '500.00',
  },
  {
    accommodationType: 'villa',
    name: 'Standard',
    minPrice: '500.00',
    maxPrice: '1000.00',
  },
  {
    accommodationType: 'villa',
    name: 'Premium',
    minPrice: '1000.00',
    maxPrice: '2500.00',
  },
  {
    accommodationType: 'villa',
    name: 'Luxury',
    minPrice: '2500.00',
    maxPrice: '5000.00',
  },
  // B&B — single fixed price
  {
    accommodationType: 'b_and_b',
    name: 'Standard',
    minPrice: '40.00',
    maxPrice: null,
  },
  // Hostel — single fixed price
  {
    accommodationType: 'hostel',
    name: 'Standard',
    minPrice: '20.00',
    maxPrice: null,
  },
];
