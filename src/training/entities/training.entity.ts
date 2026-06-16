import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('trainings')
export class Training {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ name: 'start_time', type: 'varchar', length: 16 })
  startTime: string;

  @Column({ name: 'end_time', type: 'varchar', length: 16 })
  endTime: string;

  @Column({ type: 'varchar', length: 64 })
  duration: string;

  @Column({ type: 'jsonb' })
  topics: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;
}
