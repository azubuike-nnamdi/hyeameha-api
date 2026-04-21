import type { Server } from 'http';
import type { Response } from 'superagent';
import type {
  AuthSuccessBody,
  HealthResponseBody,
  PublicUserBody,
} from './e2e-types';

function bodyAs<T>(res: Response): T {
  const payload: unknown = (res as unknown as { body: unknown }).body;
  return payload as T;
}

export function expectHealthBody(res: Response): void {
  const body = bodyAs<HealthResponseBody>(res);
  expect(body.status).toBe('ok');
  expect(body.database).toBe('connected');
}

export function expectAuthSuccess(res: Response): AuthSuccessBody {
  const body = bodyAs<AuthSuccessBody>(res);
  expect(body.accessToken).toBeDefined();
  expect(typeof body.accessToken).toBe('string');
  expect(body.refreshToken).toBeDefined();
  expect(typeof body.refreshToken).toBe('string');
  return body;
}

export function expectPublicUser(res: Response): PublicUserBody {
  return bodyAs<PublicUserBody>(res);
}

export function serverOrThrow(httpServer: unknown): Server {
  if (typeof httpServer === 'object' && httpServer !== null) {
    return httpServer as Server;
  }
  throw new Error('Expected HTTP server');
}
