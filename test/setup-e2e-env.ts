/**
 * Runs before e2e tests (see jest-e2e.json) so `AppConfigModule` / Joi validation passes
 * before `AppModule` is loaded.
 */
const longSecret = 'e2e-test-jwt-secret-minimum-32-chars-long';

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_HOST: process.env.DATABASE_HOST ?? '127.0.0.1',
  DATABASE_PORT: process.env.DATABASE_PORT ?? '5432',
  DATABASE_USER: process.env.DATABASE_USER ?? 'postgres',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ?? 'postgres',
  DATABASE_NAME: process.env.DATABASE_NAME ?? 'hyeameha',
  REDIS_HOST: process.env.REDIS_HOST ?? '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT ?? '6379',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? longSecret,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? `${longSecret}-refresh`,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? '7d',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  THROTTLE_AUTH_TTL: process.env.THROTTLE_AUTH_TTL ?? '60',
  THROTTLE_AUTH_LIMIT: process.env.THROTTLE_AUTH_LIMIT ?? '5',
  THROTTLE_DEFAULT_TTL: process.env.THROTTLE_DEFAULT_TTL ?? '60',
  THROTTLE_DEFAULT_LIMIT: process.env.THROTTLE_DEFAULT_LIMIT ?? '100',
});
