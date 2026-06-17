import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import {
  AuthLoginApiResponseDto,
  AuthMessageApiResponseDto,
  AuthRefreshApiResponseDto,
  AuthRegisterApiResponseDto,
} from '../auth/dto/auth-api-response.dto';
import { AuthResponseUserDto } from '../auth/dto/auth-response.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { RefreshTokenDto } from '../auth/dto/refresh-token.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { ApiMessageResponseDto } from '../common/dto/api-data-response.dto';
import { CreateEventDto } from '../events/dto/create-event.dto';
import {
  EventApiResponseDto,
  EventDeleteApiResponseDto,
  EventListApiResponseDto,
} from '../events/dto/events-api-response.dto';
import {
  EventResponseDto,
  PartnerEventTicketDto,
} from '../events/dto/event-response.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';
import { CreateTrainingDto } from '../training/dto/create-training.dto';
import {
  TrainingApiResponseDto,
  TrainingDeleteApiResponseDto,
  TrainingListApiResponseDto,
} from '../training/dto/trainings-api-response.dto';
import { TrainingResponseDto } from '../training/dto/training-response.dto';
import { UpdateTrainingDto } from '../training/dto/update-training.dto';
import { CreateAccommodationBudgetDto } from '../accommodation/dto/create-accommodation-budget.dto';
import { UpdateAccommodationBudgetDto } from '../accommodation/dto/update-accommodation-budget.dto';
import { AccommodationBudgetResponseDto } from '../accommodation/dto/accommodation-budget-response.dto';
import {
  AccommodationBudgetApiResponseDto,
  AccommodationBudgetDeleteApiResponseDto,
  AccommodationBudgetListApiResponseDto,
} from '../accommodation/dto/accommodation-budgets-api-response.dto';
import { CreateAccommodationBookingDto } from '../accommodation/dto/create-accommodation-booking.dto';
import { AccommodationBookingResponseDto } from '../accommodation/dto/accommodation-booking-response.dto';
import {
  AccommodationBookingApiResponseDto,
  AccommodationBookingListApiResponseDto,
} from '../accommodation/dto/accommodation-bookings-api-response.dto';
import { HealthApiResponseDto } from '../health/dto/health-api-response.dto';
import {
  AccountDeletionApiResponseDto,
  UserApiResponseDto,
  UserListApiResponseDto,
} from '../users/dto/users-api-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  // Honor X-Forwarded-For / X-Real-IP for login notification emails
  const httpAdapter = app.getHttpAdapter().getInstance() as {
    set?: (key: string, value: boolean) => void;
  };
  httpAdapter.set?.('trust proxy', true);

  const isProd = config.get<string>('NODE_ENV') === 'production';
  // Strict CSP breaks Swagger UI in many browsers; keep full helmet defaults in production only.
  app.use(
    helmet(
      isProd
        ? {}
        : {
            contentSecurityPolicy: false,
          },
    ),
  );

  const corsOrigin = config.getOrThrow<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'health', method: RequestMethod.ALL },
      { path: 'docs', method: RequestMethod.ALL },
      { path: 'docs-json', method: RequestMethod.ALL },
    ],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hyeameha API')
    .setDescription(
      [
        'REST API for web and mobile clients.',
        '',
        '### Base URL',
        '- Versioned routes: `/api/v1`',
        '- Public: `/health`, `/docs`, `/docs-json`',
        '',
        '### Response format',
        '- Success: `{ statusCode, message, data }`',
        '- Error: `{ statusCode, message, data }` (`data` is `null`, or `{ errors: string[] }` for validation failures)',
        '',
        '### Authentication',
        '- Protected routes: `Authorization: Bearer <accessToken>`',
        '- Register: `POST /api/v1/auth/register` — welcome email; tokens and `user` in `data`',
        '- Login: `POST /api/v1/auth/login` — login alert email (IP / device); tokens and `user` in `data`',
        '- Refresh: `POST /api/v1/auth/refresh` — body `{ refreshToken }`; new tokens in `data`',
        '- Forgot password: `POST /api/v1/auth/forgot-password` — body `{ email }`; sends OTP email',
        '- Reset password: `POST /api/v1/auth/reset-password` — body `{ email, otp, newPassword }`',
        '- Failed API responses (HTTP ≥ 400) are logged to PostgreSQL table `api_failure_logs` with searchable `tag` (`login`, `register`, `events`, …)',
        '- `user.role`: `user` (default), `editor`, `admin`, or `super_admin` (set in DB)',
        '',
        '### Users',
        '- `GET /api/v1/users/me` — current profile (all authenticated users)',
        '- `PATCH|POST|DELETE /api/v1/users/me` — manage own profile (all authenticated users)',
        '- `GET /api/v1/users` — list all users (**super_admin or admin only**)',
        '',
        '### Events',
        '- `GET /api/v1/events` — local events (`source: local`) + eGotickets partner events (`source: partner`)',
        '- `GET /api/v1/events/:id` — UUID (local) or numeric id (partner); partner detail includes `tickets`',
        '- `POST|PATCH|DELETE /api/v1/events` — **admin only**; local UUID events only',
        '- `POST /api/v1/events/:id/calculate_charges` — proxy to eGotickets (partner id; body forwarded)',
        '- `POST /api/v1/events/:id/buy_ticket` — proxy to eGotickets (partner id; body forwarded)',
        '- Local create/update: `eventDate` `YYYY-MM-DD`; `status` one of `popular`, `ongoing`, `new`',
        '',
        '### Trainings',
        '- `GET /api/v1/trainings` — list training programmes (all authenticated users)',
        '- `GET /api/v1/trainings/:id` — get one programme (all authenticated users)',
        '- `POST|PATCH|DELETE /api/v1/trainings` — **super_admin, admin, or editor only**',
        '- Body fields: `title`, `location`, `startTime`, `endTime`, `duration`, `topics` (string array)',
        '',
        '### Accommodation budgets',
        '- `GET /api/v1/accommodation/budgets` — list budget tiers grouped by accommodation type',
        '- `GET /api/v1/accommodation/budgets?accommodationType=hotel` — tiers for one type (e.g. Standard, Premium, Luxury, VIP)',
        '- `GET /api/v1/accommodation/budgets/:id` — get one budget tier',
        '- `POST|PATCH|DELETE /api/v1/accommodation/budgets` — **super_admin or admin only**',
        '- `accommodationType`: `hostel`, `b_and_b`, `guesthouse`, `hotel`, `apartment`, `villa`',
        '- `name`: tier within the type — hotel: Standard, Premium, Luxury, VIP; guesthouse/apartment/villa: Economy, Standard, Premium, Luxury',
        '- **Fixed price:** set `minPrice` only (omit `maxPrice`) — e.g. B&B at $40/night',
        '- **Price range:** set both `minPrice` and `maxPrice`',
        '',
        '### Accommodation bookings',
        '- `POST /api/v1/accommodation/bookings` — book accommodation (all authenticated users)',
        '- `GET /api/v1/accommodation/bookings` — users see own bookings; admins see all',
        '- `GET /api/v1/accommodation/bookings/:id` — users see own booking; admins see any',
        '- When `isBookingForSelf` is false, `guestFirstName`, `guestLastName`, `guestEmail`, and `guestPhone` are required',
        '- `bookedByUserId` is always captured from the access token',
        '',
        'Full reference: [docs/README.md](../docs/README.md)',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .addTag(
      'auth',
      'Registration, login, refresh, password reset, and email notifications',
    )
    .addTag(
      'users',
      'Current user profile (Bearer auth); list all users (super_admin or admin only)',
    )
    .addTag(
      'events',
      'Local events (admin CRUD) and eGotickets partner events (read + book)',
    )
    .addTag(
      'trainings',
      'Training programmes (read for all users; CRUD for super_admin, admin, editor)',
    )
    .addTag(
      'accommodation-budgets',
      'Accommodation budget tiers (read for all; manage for super_admin, admin)',
    )
    .addTag(
      'accommodation-bookings',
      'Accommodation bookings (users book; admins view all)',
    )
    .addTag('health', 'Liveness and DB check')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    extraModels: [
      RegisterDto,
      LoginDto,
      AuthRegisterApiResponseDto,
      AuthLoginApiResponseDto,
      RefreshTokenDto,
      AuthRefreshApiResponseDto,
      ForgotPasswordDto,
      ResetPasswordDto,
      AuthMessageApiResponseDto,
      AuthResponseUserDto,
      ApiMessageResponseDto,
      UserResponseDto,
      UserApiResponseDto,
      UserListApiResponseDto,
      AccountDeletionApiResponseDto,
      HealthApiResponseDto,
      CreateEventDto,
      UpdateEventDto,
      EventResponseDto,
      PartnerEventTicketDto,
      EventListApiResponseDto,
      EventApiResponseDto,
      EventDeleteApiResponseDto,
      CreateTrainingDto,
      UpdateTrainingDto,
      TrainingResponseDto,
      TrainingListApiResponseDto,
      TrainingApiResponseDto,
      TrainingDeleteApiResponseDto,
      CreateAccommodationBudgetDto,
      UpdateAccommodationBudgetDto,
      AccommodationBudgetResponseDto,
      AccommodationBudgetListApiResponseDto,
      AccommodationBudgetApiResponseDto,
      AccommodationBudgetDeleteApiResponseDto,
      CreateAccommodationBookingDto,
      AccommodationBookingResponseDto,
      AccommodationBookingListApiResponseDto,
      AccommodationBookingApiResponseDto,
    ],
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    jsonDocumentUrl: 'docs-json',
  });
}
