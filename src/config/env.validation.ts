import * as Joi from 'joi';

/**
 * Validates `process.env` at bootstrap. All secrets and DB credentials must be supplied via env
 * (e.g. `.env`, Docker `environment`, or orchestrator secrets). Optional keys use Joi defaults only.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),

  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  THROTTLE_AUTH_TTL: Joi.number().integer().positive().default(60),
  THROTTLE_AUTH_LIMIT: Joi.number().integer().positive().default(5),
  THROTTLE_DEFAULT_TTL: Joi.number().integer().positive().default(60),
  THROTTLE_DEFAULT_LIMIT: Joi.number().integer().positive().default(100),
});
