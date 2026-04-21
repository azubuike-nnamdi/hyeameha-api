import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import {
  AuthResponseUserDto,
  RegisterResponseDto,
} from '../auth/dto/auth-response.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  app.use(helmet());

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
        '- **Base path:** `/api/v1` for versioned routes; `/health` and `/docs` are at the root.',
        '- **Auth:** `POST /api/v1/auth/register` (`phone`: 7–15 digits only; returns `message`, `refreshToken`, tokens, `user`). `POST /api/v1/auth/login` returns `message`, `accessToken`, and `user` (no refresh token).',
        '- **Protected routes:** send header `Authorization: Bearer <accessToken>`.',
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
    .addTag('auth', 'Registration and login')
    .addTag('users', 'Current user profile (Bearer auth)')
    .addTag('health', 'Liveness and DB check')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    extraModels: [
      RegisterDto,
      LoginDto,
      RegisterResponseDto,
      LoginResponseDto,
      AuthResponseUserDto,
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
