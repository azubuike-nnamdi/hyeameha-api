import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordResetOtp } from '../auth/entities/password-reset-otp.entity';
import { Event } from '../events/entities/event.entity';
import { ApiFailureLog } from '../logging/entities/api-failure-log.entity';
import { AccommodationBooking } from '../accommodation/entities/accommodation-booking.entity';
import { AccommodationBudget } from '../accommodation/entities/accommodation-budget.entity';
import { Airline } from '../airport-pickup/entities/airline.entity';
import { AirportPickupBooking } from '../airport-pickup/entities/airport-pickup-booking.entity';
import { Ride } from '../rides/entities/ride.entity';
import { RideBooking } from '../rides/entities/ride-booking.entity';
import { Training } from '../training/entities/training.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DATABASE_HOST'),
        port: config.getOrThrow<number>('DATABASE_PORT'),
        username: config.getOrThrow<string>('DATABASE_USER'),
        password: config.getOrThrow<string>('DATABASE_PASSWORD'),
        database: config.getOrThrow<string>('DATABASE_NAME'),
        entities: [
          User,
          Event,
          Training,
          AccommodationBudget,
          AccommodationBooking,
          Airline,
          AirportPickupBooking,
          Ride,
          RideBooking,
          PasswordResetOtp,
          ApiFailureLog,
        ],
        synchronize: config.getOrThrow<string>('NODE_ENV') !== 'production',
        logging: config.getOrThrow<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
