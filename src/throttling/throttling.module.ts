import { Logger, Module } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';
import { AUTH_THROTTLE_KEY } from './auth-throttle.decorator';
import { RedisThrottlerStorage } from './redis-throttler.storage';

const logger = new Logger('ThrottlingModule');

function hasAuthThrottle(context: ExecutionContext): boolean {
  return (
    Reflect.getMetadata(AUTH_THROTTLE_KEY, context.getHandler()) === true ||
    Reflect.getMetadata(AUTH_THROTTLE_KEY, context.getClass()) === true
  );
}

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        let storage: RedisThrottlerStorage | undefined;
        if (config.get<string>('THROTTLE_STORAGE') !== 'memory') {
          const redis = new Redis({
            host: config.getOrThrow<string>('REDIS_HOST'),
            port: config.getOrThrow<number>('REDIS_PORT'),
            password: config.get<string>('REDIS_PASSWORD') || undefined,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
          });
          // Log once per outage instead of on every reconnect attempt.
          let reportedDown = false;
          redis.on('error', (error: Error) => {
            if (!reportedDown) {
              reportedDown = true;
              logger.warn(
                `Redis (rate limiting) unavailable, requests are not limited: ${error.message}`,
              );
            }
          });
          redis.on('ready', () => {
            if (reportedDown) {
              reportedDown = false;
              logger.log('Redis (rate limiting) connection restored');
            }
          });
          storage = new RedisThrottlerStorage(redis);
        }

        return {
          storage,
          errorMessage: 'Too many requests, please try again later.',
          throttlers: [
            {
              name: 'default',
              ttl: config.getOrThrow<number>('THROTTLE_DEFAULT_TTL') * 1000,
              limit: config.getOrThrow<number>('THROTTLE_DEFAULT_LIMIT'),
            },
            {
              name: 'auth',
              ttl: config.getOrThrow<number>('THROTTLE_AUTH_TTL') * 1000,
              limit: config.getOrThrow<number>('THROTTLE_AUTH_LIMIT'),
              skipIf: (context) => !hasAuthThrottle(context),
            },
          ],
        };
      },
    }),
  ],
})
export class ThrottlingModule {}
