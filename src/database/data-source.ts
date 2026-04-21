import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export default new DataSource({
  type: 'postgres',
  host: requireEnv('DATABASE_HOST'),
  port: Number(requireEnv('DATABASE_PORT')),
  username: requireEnv('DATABASE_USER'),
  password: requireEnv('DATABASE_PASSWORD'),
  database: requireEnv('DATABASE_NAME'),
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
});
