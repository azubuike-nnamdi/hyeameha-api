import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AccommodationBookingsController } from './accommodation-bookings.controller';
import { AccommodationBookingsService } from './accommodation-bookings.service';
import { AccommodationBudgetsController } from './accommodation-budgets.controller';
import { AccommodationBudgetsService } from './accommodation-budgets.service';
import { AccommodationBooking } from './entities/accommodation-booking.entity';
import { AccommodationBudget } from './entities/accommodation-budget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccommodationBudget, AccommodationBooking]),
  ],
  controllers: [
    AccommodationBudgetsController,
    AccommodationBookingsController,
  ],
  providers: [
    AccommodationBudgetsService,
    AccommodationBookingsService,
    RolesGuard,
  ],
})
export class AccommodationModule {}
