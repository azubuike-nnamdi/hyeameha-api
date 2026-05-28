import 'dotenv/config';
import { DataSource } from 'typeorm';
import { PasswordResetOtp } from '../auth/entities/password-reset-otp.entity';
import { Event } from '../events/entities/event.entity';
import { ApiFailureLog } from '../logging/entities/api-failure-log.entity';
import { User } from '../users/entities/user.entity';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

/** CLI-only: skip entity metadata when running migrations (faster ts-node startup). */
const migrationsOnly = process.env.TYPEORM_MIGRATIONS_ONLY === '1';

export default new DataSource({
  type: 'postgres',
  host: requireEnv('DATABASE_HOST'),
  port: Number(requireEnv('DATABASE_PORT')),
  username: requireEnv('DATABASE_USER'),
  password: requireEnv('DATABASE_PASSWORD'),
  database: requireEnv('DATABASE_NAME'),
  entities: migrationsOnly
    ? []
    : [User, Event, PasswordResetOtp, ApiFailureLog],
  migrations: ['src/database/migrations/*.ts'],
  extra: {
    connectionTimeoutMillis: 10_000,
  },
});
