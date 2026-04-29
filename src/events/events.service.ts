import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

type EventSeedRow = Pick<
  Event,
  'title' | 'location' | 'image' | 'eventDate' | 'status' | 'type' | 'price'
>;

const DEFAULT_EVENTS: EventSeedRow[] = [
  {
    title: 'Global Tech Expo 2026',
    location: 'Convention Center, Accra',
    image: 'https://placehold.co/800x400/1a1a2e/fff?text=Global+Tech+Expo+2026',
    eventDate: '2026-01-24',
    status: 'popular',
    type: 'Technology',
    price: '$50',
  },
  {
    title: 'Vibrant Music Fest',
    location: 'Black Star Square, Accra',
    image: 'https://placehold.co/800x400/16213e/fff?text=Vibrant+Music+Fest',
    eventDate: '2026-08-15',
    status: 'ongoing',
    type: 'Entertainment',
    price: 'Free',
  },
  {
    title: 'Innovation Summit',
    location: 'Movenpick Hotel',
    image: 'https://placehold.co/800x400/0f3460/fff?text=Innovation+Summit',
    eventDate: '2026-02-10',
    status: 'new',
    type: 'Business',
    price: '$100',
  },
];

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async create(dto: CreateEventDto, userId: string): Promise<Event> {
    const entity = this.eventsRepository.create({
      ...dto,
      updatedBy: userId,
    });
    return this.eventsRepository.save(entity);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      order: { eventDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, dto, { updatedBy: userId });
    return this.eventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Event not found');
    }
  }

  /** Inserts the default catalog once in development when the table is empty. */
  async seedDefaultsIfEmptyInDevelopment(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    const count = await this.eventsRepository.count();
    if (count > 0) {
      return;
    }
    const rows = DEFAULT_EVENTS.map((row) =>
      this.eventsRepository.create({ ...row, updatedBy: null }),
    );
    await this.eventsRepository.save(rows);
  }
}
