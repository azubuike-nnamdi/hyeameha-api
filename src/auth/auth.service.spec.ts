import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('refresh-hash'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    validatePassword: jest.fn(),
    setRefreshTokenHash: jest.fn(),
    create: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('signed'),
    verifyAsync: jest.fn(),
  };
  const config = { getOrThrow: jest.fn().mockReturnValue('x'.repeat(32)) };
  const mailService = {
    sendLoginAlertEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  };
  const context = {
    ipAddress: '1.1.1.1',
    userAgent: null,
    locationSummary: 'IP address 1.1.1.1',
  };
  const user = {
    id: 'u1',
    email: 'a@b.com',
    passwordHash: 'h',
    firstName: 'A',
    lastName: 'B',
    phone: null,
    role: 'user',
    tokenVersion: 3,
    refreshTokenHash: 'stored',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('still runs a password comparison for unknown emails', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.validatePassword.mockResolvedValue(false);
    await expect(
      service.login({ email: 'x@b.com', password: 'p' }, context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.validatePassword).toHaveBeenCalledWith(
      { passwordHash: expect.stringMatching(/^\$2b\$10\$/) as string },
      'p',
    );
  });

  it('embeds the token version in issued tokens', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    usersService.validatePassword.mockResolvedValue(true);
    await service.login({ email: 'a@b.com', password: 'p' }, context);
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'a@b.com',
      ver: 3,
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 'u1', email: 'a@b.com', ver: 3, typ: 'refresh' },
      expect.any(Object),
    );
  });

  it('rejects refresh tokens from an older session version', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'u1',
      email: 'a@b.com',
      ver: 2,
      typ: 'refresh',
    });
    usersService.findOne.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await expect(service.refresh('token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('refreshes tokens for the current session version', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'u1',
      email: 'a@b.com',
      ver: 3,
      typ: 'refresh',
    });
    usersService.findOne.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await expect(service.refresh('token')).resolves.toEqual({
      accessToken: 'signed',
      refreshToken: 'signed',
    });
  });

  it('rejects access tokens used as refresh tokens', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'u1', email: 'a@b.com' });
    await expect(service.refresh('token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
