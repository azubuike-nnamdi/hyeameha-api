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

  interface AuthSessionData {
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

  interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T;
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
    const body = res.body as ApiEnvelope<{
      status?: string;
      database?: string;
    }>;
    expect(body.statusCode).toBe(200);
    expect(body.message).toBe('Service is healthy');
    expect(body.data.status).toBe('ok');
    expect(body.data.database).toBe('connected');
  });

  it('GET /api/v1/users/me should require auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .expect(401);
    const body = res.body as ApiEnvelope<null>;
    expect(body.statusCode).toBe(401);
    expect(body.message).toBeDefined();
    expect(body.data).toBeNull();
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

    const body = res.body as ApiEnvelope<AuthSessionData>;
    expect(body.statusCode).toBe(201);
    expect(body.message).toBe('Registration successful');
    expect(body.data.user.email).toBe(email);
    expect(body.data.user.phone).toBe('15551234567');
    expect(body.data.user.password).toBeUndefined();
    expect(body.data.accessToken).toBeDefined();
    expect(typeof body.data.accessToken).toBe('string');
    expect(body.data.refreshToken).toBeDefined();
    expect(typeof body.data.refreshToken).toBe('string');

    accessToken = body.data.accessToken;
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

    const res = await request(app.getHttpServer())
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

    const body = res.body as ApiEnvelope<null>;
    expect(body.statusCode).toBe(409);
    expect(body.message).toBeDefined();
    expect(body.data).toBeNull();
  });

  it('POST /api/v1/auth/login should return 401 for wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);

    const body = res.body as ApiEnvelope<null>;
    expect(body.statusCode).toBe(401);
    expect(body.message).toBe('Invalid email or password');
    expect(body.data).toBeNull();
  });

  it('POST /api/v1/auth/login should issue access and refresh tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);

    const body = res.body as ApiEnvelope<AuthSessionData>;
    expect(body.statusCode).toBe(200);
    expect(body.message).toBe('Login successful');
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
    expect(body.data.user.email).toBe(email);
  });

  it('POST /api/v1/auth/refresh should issue new access token', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);

    const loginBody = loginRes.body as ApiEnvelope<AuthSessionData>;

    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: loginBody.data.refreshToken })
      .expect(200);

    const refreshBody = refreshRes.body as ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
    }>;
    expect(refreshBody.statusCode).toBe(200);
    expect(refreshBody.message).toBe('Tokens refreshed');
    expect(refreshBody.data.accessToken).toBeDefined();
    expect(refreshBody.data.refreshToken).toBeDefined();
    expect(refreshBody.data.accessToken).not.toBe(loginBody.data.accessToken);

    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${refreshBody.data.accessToken}`)
      .expect(200);
  });

  it('GET /api/v1/users/me should return authenticated user (sanitized)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = res.body as ApiEnvelope<{
      email?: string;
      password?: string;
      refreshTokenHash?: string;
    }>;
    expect(body.statusCode).toBe(200);
    expect(body.data.email).toBe(email);
    expect(body.data.password).toBeUndefined();
    expect(body.data.refreshTokenHash).toBeUndefined();
  });

  it('GET /api/v1/users should forbid non-admin users', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);

    const body = res.body as ApiEnvelope<null>;
    expect(body.statusCode).toBe(403);
    expect(body.message).toBe('Insufficient permissions');
    expect(body.data).toBeNull();
  });

  it('PATCH /api/v1/users/me should update profile', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Updated', lastName: 'Name' })
      .expect(200);

    const body = res.body as ApiEnvelope<{
      firstName?: string;
      lastName?: string;
    }>;
    expect(body.statusCode).toBe(200);
    expect(body.data.firstName).toBe('Updated');
    expect(body.data.lastName).toBe('Name');
  });
});
