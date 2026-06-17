export const VEHICLE_TYPES = ['saloon', 'suv', 'mini_bus', 'coach'] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];
