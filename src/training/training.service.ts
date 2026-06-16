import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from './entities/training.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private readonly trainingsRepository: Repository<Training>,
  ) {}

  async create(dto: CreateTrainingDto, userId: string): Promise<Training> {
    const entity = this.trainingsRepository.create({
      ...dto,
      updatedBy: userId,
    });
    return this.trainingsRepository.save(entity);
  }

  async findAll(): Promise<Training[]> {
    return this.trainingsRepository.find({ order: { title: 'ASC' } });
  }

  async findOne(id: string): Promise<Training> {
    const training = await this.trainingsRepository.findOne({ where: { id } });
    if (!training) {
      throw new NotFoundException('Training not found');
    }
    return training;
  }

  async update(
    id: string,
    dto: UpdateTrainingDto,
    userId: string,
  ): Promise<Training> {
    const training = await this.findOne(id);
    Object.assign(training, dto, { updatedBy: userId });
    return this.trainingsRepository.save(training);
  }

  async remove(id: string): Promise<void> {
    const result = await this.trainingsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Training not found');
    }
  }
}
