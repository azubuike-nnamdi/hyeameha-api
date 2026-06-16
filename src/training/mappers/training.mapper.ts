import { Training } from '../entities/training.entity';
import { TrainingResponseDto } from '../dto/training-response.dto';

export function toTrainingResponseDto(training: Training): TrainingResponseDto {
  return {
    id: training.id,
    title: training.title,
    location: training.location,
    startTime: training.startTime,
    endTime: training.endTime,
    duration: training.duration,
    topics: training.topics,
    createdAt: training.createdAt,
    updatedAt: training.updatedAt,
    updatedBy: training.updatedBy,
  };
}
