import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Client } from 'pg';
import * as request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap/configure-app';

/** Matches registration validation: 9+ chars, uppercase, digit, special. */
const PASSWORD = 'TestPass123!';

describe('Hyeameha API e2e', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  const email = `e2e+${Date.now()}@example.com`;

  interface AuthResponseBody {
    message: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string | null;
      password?: string;
    };
    accessToken: string;
    refreshToken: string;
  }

  beforeAll(async () => {
    const pgClient = new Client({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    await pgClient.connect();
    await pgClient.query('DROP TABLE IF EXISTS users CASCADE');
    await pgClient.end();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  }, 120000);

  afterAll(async () => {
    await app?.close();
  });

  it('GET /health should be public and return status', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    const body = res.body as { status?: string; database?: string };
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
  });

  it('GET /api/v1/users/me should require auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
  });

  it('POST /api/v1/auth/register should issue access token and sanitized user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-correlation-id', randomUUID())
      .send({
        firstName: 'E2E',
        lastName: 'Tester',
        email,
        password: PASSWORD,
        phone: '15551234567',
      })
      .expect(201);

    const body = res.body as AuthResponseBody;
    expect(body.message).toBe('Registration successful');
    expect(body.user.email).toBe(email);
    expect(body.user.phone).toBe('15551234567');
    expect(body.user.password).toBeUndefined();
    expect(body.accessToken).toBeDefined();
    expect(typeof body.accessToken).toBe('string');
    expect(body.refreshToken).toBeDefined();
    expect(typeof body.refreshToken).toBe('string');

    accessToken = body.accessToken;
  });

  it('POST /api/v1/auth/register should return 409 for duplicate email', async () => {
    const dupEmail = `dup+${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-correlation-id', randomUUID())
      .send({
        firstName: 'First',
        lastName: 'User',
        email: dupEmail,
        password: PASSWORD,
        phone: '15551234568',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-correlation-id', randomUUID())
      .send({
        firstName: 'Other',
        lastName: 'Name',
        email: dupEmail,
        password: PASSWORD,
        phone: '15551234569',
      })
      .expect(409);
  });

  it('POST /api/v1/auth/login should return 401 for wrong password', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });

  it('GET /api/v1/users/me should return authenticated user (sanitized)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = res.body as {
      email?: string;
      password?: string;
      refreshTokenHash?: string;
    };
    expect(body.email).toBe(email);
    expect(body.password).toBeUndefined();
    expect(body.refreshTokenHash).toBeUndefined();
  });

  it('PATCH /api/v1/users/me should update profile', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Updated', lastName: 'Name' })
      .expect(200);

    const body = res.body as { firstName?: string; lastName?: string };
    expect(body.firstName).toBe('Updated');
    expect(body.lastName).toBe('Name');
  });
});
