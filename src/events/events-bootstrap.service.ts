import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventsService } from './events.service';

@Injectable()
export class EventsBootstrapService implements OnApplicationBootstrap {
  constructor(private readonly eventsService: EventsService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.eventsService.seedDefaultsIfEmptyInDevelopment();
  }
}
