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
import { AccommodationBudget } from './accommodation-budget.entity';

@Entity('accommodation_bookings')
export class AccommodationBooking {
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

  @Column({ name: 'accommodation_type', type: 'varchar', length: 64 })
  accommodationType: string;

  @Column({ name: 'budget_id', type: 'uuid' })
  budgetId: string;

  @ManyToOne(() => AccommodationBudget, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'budget_id' })
  budget: AccommodationBudget;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate: string;

  @Column({ name: 'check_in_time', type: 'varchar', length: 8 })
  checkInTime: string;

  @Column({ name: 'check_out_date', type: 'date' })
  checkOutDate: string;

  @Column({ name: 'number_of_days', type: 'integer' })
  numberOfDays: number;

  @Column({ name: 'additional_info', type: 'text', nullable: true })
  additionalInfo: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
