import { Airline } from '../entities/airline.entity';
import { AirlineResponseDto } from '../dto/airline-response.dto';

export function toAirlineResponseDto(airline: Airline): AirlineResponseDto {
  return {
    id: airline.id,
    name: airline.name,
    code: airline.code,
    isActive: airline.isActive,
    createdAt: airline.createdAt,
    updatedAt: airline.updatedAt,
    updatedBy: airline.updatedBy,
  };
}
