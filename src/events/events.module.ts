import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PartnerEventsClient } from './partner/partner-events.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    HttpModule.register({ timeout: 30_000, maxRedirects: 3 }),
  ],
  controllers: [EventsController],
  providers: [EventsService, PartnerEventsClient, RolesGuard],
})
export class EventsModule {}
