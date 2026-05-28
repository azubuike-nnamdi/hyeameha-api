import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { toEventResponseDto } from './mappers/event.mapper';
import { toPartnerEventResponseDto } from './mappers/partner-event.mapper';
import { PartnerEventsClient } from './partner/partner-events.client';
import { isLocalEventId } from './utils/event-id.util';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    private readonly partnerEvents: PartnerEventsClient,
  ) {}

  async create(dto: CreateEventDto, userId: string): Promise<Event> {
    const entity = this.eventsRepository.create({
      ...dto,
      updatedBy: userId,
    });
    return this.eventsRepository.save(entity);
  }

  async findAll(): Promise<EventResponseDto[]> {
    const [localEvents, partnerEvents] = await Promise.all([
      this.eventsRepository.find({ order: { eventDate: 'ASC' } }),
      this.partnerEvents.listEvents(),
    ]);

    const local = localEvents.map(toEventResponseDto);
    const partner = partnerEvents.map((event) =>
      toPartnerEventResponseDto(event),
    );
    return [...local, ...partner];
  }

  async findOne(id: string): Promise<EventResponseDto> {
    if (isLocalEventId(id)) {
      const event = await this.eventsRepository.findOne({ where: { id } });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      return toEventResponseDto(event);
    }

    try {
      const partnerEvent = await this.partnerEvents.getEvent(id);
      return toPartnerEventResponseDto(partnerEvent, { includeTickets: true });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new NotFoundException('Event not found');
    }
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    this.assertLocalEventId(id);
    const event = await this.findLocalEntity(id);
    Object.assign(event, dto, { updatedBy: userId });
    return this.eventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    this.assertLocalEventId(id);
    const result = await this.eventsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Event not found');
    }
  }

  async calculateCharges(
    id: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    this.assertPartnerEventId(id);
    return this.partnerEvents.calculateCharges(id, body);
  }

  async buyTicket(
    id: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    this.assertPartnerEventId(id);
    return this.partnerEvents.buyTicket(id, body);
  }

  private assertLocalEventId(id: string): void {
    if (!isLocalEventId(id)) {
      throw new BadRequestException(
        'Only locally managed events can be created, updated, or deleted',
      );
    }
  }

  private assertPartnerEventId(id: string): void {
    if (isLocalEventId(id)) {
      throw new BadRequestException(
        'Ticket booking is only available for partner events',
      );
    }
  }

  private async findLocalEntity(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }
}
