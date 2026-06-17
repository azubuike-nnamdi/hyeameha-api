import { Ride } from '../entities/ride.entity';
import { RideResponseDto } from '../dto/ride-response.dto';

export function toRideResponseDto(ride: Ride): RideResponseDto {
  return {
    id: ride.id,
    vehicleType: ride.vehicleType,
    serviceTier: ride.serviceTier,
    maxPassengers: ride.maxPassengers,
    maxLuggage: ride.maxLuggage,
    description: ride.description,
    imageUrl: ride.imageUrl,
    pricePerDay: ride.pricePerDay,
    isActive: ride.isActive,
    createdAt: ride.createdAt,
    updatedAt: ride.updatedAt,
    updatedBy: ride.updatedBy,
  };
}
