export const SERVICE_TIERS = ['regular', 'comfort', 'vvip'] as const;

export type ServiceTier = (typeof SERVICE_TIERS)[number];
