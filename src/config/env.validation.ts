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

  EVENT_BASE_URL: Joi.string().uri().required(),
  EVENT_API_KEY: Joi.string().min(1).required(),

  MAIL_ENABLED: Joi.string().valid('true', 'false').default('true'),
  ALTER_MAIL_KEY: Joi.string().min(1).required(),
  ALTERMAIL_API_URL: Joi.string()
    .uri()
    .default('https://api.altermail-console.com.ng/v1/user/email/send'),
  MAIL_FROM: Joi.string().email().required(),
  PASSWORD_RESET_OTP_EXPIRES_MINUTES: Joi.number()
    .integer()
    .positive()
    .default(15),
  PASSWORD_RESET_OTP_LENGTH: Joi.number().integer().min(4).max(8).default(6),
});
