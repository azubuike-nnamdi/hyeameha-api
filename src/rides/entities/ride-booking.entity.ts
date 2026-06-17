import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ride } from './ride.entity';

@Entity('ride_bookings')
export class RideBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booked_by_user_id', type: 'uuid' })
  bookedByUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booked_by_user_id' })
  bookedByUser: User;

  @Column({ name: 'is_booking_for_self', type: 'boolean' })
  isBookingForSelf: boolean;

  @Column({
    name: 'guest_first_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  guestFirstName: string | null;

  @Column({
    name: 'guest_last_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  guestLastName: string | null;

  @Column({ name: 'guest_email', type: 'varchar', length: 255, nullable: true })
  guestEmail: string | null;

  @Column({ name: 'guest_phone', type: 'varchar', length: 32, nullable: true })
  guestPhone: string | null;

  @Column({ name: 'pickup_location', type: 'varchar', length: 255 })
  pickupLocation: string;

  @Column({ name: 'pickup_date', type: 'date' })
  pickupDate: string;

  @Column({ name: 'pickup_time', type: 'varchar', length: 8 })
  pickupTime: string;

  @Column({ name: 'dropoff_location', type: 'varchar', length: 255 })
  dropoffLocation: string;

  @Column({ name: 'ride_id', type: 'uuid' })
  rideId: string;

  @ManyToOne(() => Ride, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ride_id' })
  ride: Ride;

  @Column({ name: 'number_of_days', type: 'integer' })
  numberOfDays: number;

  @Column({ name: 'passenger_count', type: 'integer' })
  passengerCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ name: 'driver_note', type: 'text', nullable: true })
  driverNote: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
