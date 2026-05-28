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
        '- `user.role`: `user` (default) or `admin` (set in DB; required for event CRUD)',
        '',
        '### Events',
        '- `GET /api/v1/events` — local events (`source: local`) + eGotickets partner events (`source: partner`)',
        '- `GET /api/v1/events/:id` — UUID (local) or numeric id (partner); partner detail includes `tickets`',
        '- `POST|PATCH|DELETE /api/v1/events` — **admin only**; local UUID events only',
        '- `POST /api/v1/events/:id/calculate_charges` — proxy to eGotickets (partner id; body forwarded)',
        '- `POST /api/v1/events/:id/buy_ticket` — proxy to eGotickets (partner id; body forwarded)',
        '- Local create/update: `eventDate` `YYYY-MM-DD`; `status` one of `popular`, `ongoing`, `new`',
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
    .addTag('users', 'Current user profile (Bearer auth)')
    .addTag(
      'events',
      'Local events (admin CRUD) and eGotickets partner events (read + book)',
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
