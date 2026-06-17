import { ACCOMMODATION_TYPES } from '../../accommodation/constants/accommodation-type';

/** Budget tier names allowed per accommodation type. */
export const ACCOMMODATION_BUDGET_TIERS_BY_TYPE: Record<
  (typeof ACCOMMODATION_TYPES)[number],
  readonly string[]
> = {
  hotel: ['Standard', 'Premium', 'Luxury', 'VIP'],
  guesthouse: ['Economy', 'Standard', 'Premium', 'Luxury'],
  apartment: ['Economy', 'Standard', 'Premium', 'Luxury'],
  villa: ['Economy', 'Standard', 'Premium', 'Luxury'],
  b_and_b: ['Standard'],
  hostel: ['Standard'],
};
