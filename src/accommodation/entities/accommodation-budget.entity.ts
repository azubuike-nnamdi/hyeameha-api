import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('accommodation_budgets')
export class AccommodationBudget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({
    name: 'min_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  minPrice: string;

  @Column({
    name: 'max_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  maxPrice: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;
}
