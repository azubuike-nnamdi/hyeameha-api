import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { SERVICE_TIERS, type ServiceTier } from './constants/service-tier';
import { VEHICLE_TYPES, type VehicleType } from './constants/vehicle-type';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { Ride } from './entities/ride.entity';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly ridesRepository: Repository<Ride>,
  ) {}

  async create(dto: CreateRideDto, userId: string): Promise<Ride> {
    this.assertValidVehicleType(dto.vehicleType);
    this.assertValidServiceTier(dto.serviceTier);
    await this.assertUniqueRide(dto.vehicleType, dto.serviceTier);

    const entity = this.ridesRepository.create({
      vehicleType: dto.vehicleType,
      serviceTier: dto.serviceTier,
      maxPassengers: dto.maxPassengers,
      maxLuggage: dto.maxLuggage,
      description: dto.description,
      imageUrl: dto.imageUrl,
      pricePerDay: dto.pricePerDay.toFixed(2),
      isActive: dto.isActive ?? true,
      updatedBy: userId,
    });
    return this.ridesRepository.save(entity);
  }

  async findAll(options?: {
    activeOnly?: boolean;
    vehicleType?: VehicleType;
    serviceTier?: ServiceTier;
  }): Promise<Ride[]> {
    const where: FindOptionsWhere<Ride> = {};

    if (options?.activeOnly) {
      where.isActive = true;
    }
    if (options?.vehicleType) {
      this.assertValidVehicleType(options.vehicleType);
      where.vehicleType = options.vehicleType;
    }
    if (options?.serviceTier) {
      this.assertValidServiceTier(options.serviceTier);
      where.serviceTier = options.serviceTier;
    }

    return this.ridesRepository.find({
      where,
      order: { vehicleType: 'ASC', serviceTier: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Ride> {
    const ride = await this.ridesRepository.findOne({ where: { id } });
    if (!ride) {
      throw new NotFoundException('Ride not found');
    }
    return ride;
  }

  async findActiveForBooking(id: string): Promise<Ride> {
    const ride = await this.findOne(id);
    if (!ride.isActive) {
      throw new BadRequestException(
        'The selected ride is not available for booking',
      );
    }
    return ride;
  }

  async update(id: string, dto: UpdateRideDto, userId: string): Promise<Ride> {
    const ride = await this.findOne(id);
    const nextVehicleType = dto.vehicleType ?? ride.vehicleType;
    const nextServiceTier = dto.serviceTier ?? ride.serviceTier;

    if (dto.vehicleType !== undefined) {
      this.assertValidVehicleType(dto.vehicleType);
    }
    if (dto.serviceTier !== undefined) {
      this.assertValidServiceTier(dto.serviceTier);
    }

    if (
      nextVehicleType !== ride.vehicleType ||
      nextServiceTier !== ride.serviceTier
    ) {
      await this.assertUniqueRide(nextVehicleType, nextServiceTier, ride.id);
    }

    if (dto.vehicleType !== undefined) {
      ride.vehicleType = dto.vehicleType;
    }
    if (dto.serviceTier !== undefined) {
      ride.serviceTier = dto.serviceTier;
    }
    if (dto.maxPassengers !== undefined) {
      ride.maxPassengers = dto.maxPassengers;
    }
    if (dto.maxLuggage !== undefined) {
      ride.maxLuggage = dto.maxLuggage;
    }
    if (dto.description !== undefined) {
      ride.description = dto.description;
    }
    if (dto.imageUrl !== undefined) {
      ride.imageUrl = dto.imageUrl;
    }
    if (dto.pricePerDay !== undefined) {
      ride.pricePerDay = dto.pricePerDay.toFixed(2);
    }
    if (dto.isActive !== undefined) {
      ride.isActive = dto.isActive;
    }
    ride.updatedBy = userId;

    return this.ridesRepository.save(ride);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ridesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Ride not found');
    }
  }

  private assertValidVehicleType(vehicleType: string): void {
    if (!(VEHICLE_TYPES as readonly string[]).includes(vehicleType)) {
      throw new BadRequestException(
        `vehicleType must be one of: ${VEHICLE_TYPES.join(', ')}`,
      );
    }
  }

  private assertValidServiceTier(serviceTier: string): void {
    if (!(SERVICE_TIERS as readonly string[]).includes(serviceTier)) {
      throw new BadRequestException(
        `serviceTier must be one of: ${SERVICE_TIERS.join(', ')}`,
      );
    }
  }

  private async assertUniqueRide(
    vehicleType: string,
    serviceTier: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.ridesRepository.findOne({
      where: { vehicleType, serviceTier },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `A "${serviceTier}" ride already exists for vehicle type "${vehicleType}"`,
      );
    }
  }
}
