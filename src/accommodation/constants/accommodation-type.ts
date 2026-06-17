export const ACCOMMODATION_TYPES = [
  'hostel',
  'b_and_b',
  'guesthouse',
  'hotel',
  'apartment',
  'villa',
] as const;

export type AccommodationType = (typeof ACCOMMODATION_TYPES)[number];
