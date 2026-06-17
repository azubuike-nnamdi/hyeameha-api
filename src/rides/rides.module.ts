import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RideBookingsController } from './ride-bookings.controller';
import { RideBookingsService } from './ride-bookings.service';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';
import { RideBooking } from './entities/ride-booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ride, RideBooking])],
  controllers: [RidesController, RideBookingsController],
  providers: [RidesService, RideBookingsService, RolesGuard],
})
export class RidesModule {}
