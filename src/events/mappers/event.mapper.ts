import { Event } from '../entities/event.entity';
import { EventResponseDto } from '../dto/event-response.dto';

export function toEventResponseDto(event: Event): EventResponseDto {
  return {
    id: event.id,
    title: event.title,
    location: event.location,
    image: event.image,
    eventDate: event.eventDate,
    status: event.status,
    type: event.type,
    price: event.price,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    updatedBy: event.updatedBy,
  };
}
