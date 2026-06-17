import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AirlinesController } from './airlines.controller';
import { AirlinesService } from './airlines.service';
import { AirportPickupBookingsController } from './airport-pickup-bookings.controller';
import { AirportPickupBookingsService } from './airport-pickup-bookings.service';
import { Airline } from './entities/airline.entity';
import { AirportPickupBooking } from './entities/airport-pickup-booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Airline, AirportPickupBooking])],
  controllers: [AirlinesController, AirportPickupBookingsController],
  providers: [AirlinesService, AirportPickupBookingsService, RolesGuard],
})
export class AirportPickupModule {}
