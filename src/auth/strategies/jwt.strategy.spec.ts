import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const findByIdPublicOrNull = jest.fn();
  const strategy = new JwtStrategy(
    { getOrThrow: () => 'x'.repeat(32) } as unknown as ConfigService,
    { findByIdPublicOrNull } as unknown as UsersService,
  );
  const user = {
    id: 'u1',
    email: 'a@b.com',
    role: 'admin',
    tokenVersion: 1,
  };

  beforeEach(() => jest.clearAllMocks());

  it('accepts a token with the current version', async () => {
    findByIdPublicOrNull.mockResolvedValue(user);
    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.com', ver: 1 }),
    ).resolves.toEqual({ sub: 'u1', email: 'a@b.com', role: 'admin' });
  });

  it('rejects a token issued before a password change', async () => {
    findByIdPublicOrNull.mockResolvedValue(user);
    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.com', ver: 0 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects refresh tokens', async () => {
    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.com', typ: 'refresh' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(findByIdPublicOrNull).not.toHaveBeenCalled();
  });

  it('rejects deleted users', async () => {
    findByIdPublicOrNull.mockResolvedValue(null);
    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.com' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
