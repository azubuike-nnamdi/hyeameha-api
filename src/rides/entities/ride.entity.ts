import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rides')
@Unique('UQ_rides_vehicle_type_service_tier', ['vehicleType', 'serviceTier'])
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vehicle_type', type: 'varchar', length: 32 })
  vehicleType: string;

  @Column({ name: 'service_tier', type: 'varchar', length: 32 })
  serviceTier: string;

  @Column({ name: 'max_passengers', type: 'integer' })
  maxPassengers: number;

  @Column({ name: 'max_luggage', type: 'integer' })
  maxLuggage: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'image_url', type: 'varchar', length: 2048 })
  imageUrl: string;

  @Column({
    name: 'price_per_day',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  pricePerDay: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;
}
