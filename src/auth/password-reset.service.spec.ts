import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { PasswordResetOtp } from './entities/password-reset-otp.entity';
import { PasswordResetService } from './password-reset.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('otp-hash'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  const execute = jest.fn();
  const qb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute,
  };
  const otpRepository = {
    findOne: jest.fn(),
    delete: jest.fn(),
    create: jest.fn((v: unknown) => v),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => qb),
  };
  const usersService = {
    findByEmail: jest.fn(),
    resetPassword: jest.fn(),
  };
  const mailService = { sendPasswordResetOtpEmail: jest.fn() };
  const config = {
    get: jest.fn((key: string, fallback: unknown) =>
      key === 'PASSWORD_RESET_OTP_MAX_ATTEMPTS' ? 3 : fallback,
    ),
  };

  const record = (attempts = 0) => ({
    id: 'otp-1',
    userId: 'u1',
    email: 'a@b.com',
    otpHash: 'otp-hash',
    attempts,
    expiresAt: new Date(Date.now() + 60_000),
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: getRepositoryToken(PasswordResetOtp),
          useValue: otpRepository,
        },
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get(PasswordResetService);
  });

  it('looks up the OTP by normalized email', async () => {
    otpRepository.findOne.mockResolvedValue(null);
    await expect(
      service.resetPassword('  A@B.com ', '123456', 'New1!password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(otpRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'a@b.com' } }),
    );
  });

  it('rejects and deletes when the attempt limit is already used up', async () => {
    otpRepository.findOne.mockResolvedValue(record(3));
    execute.mockResolvedValue({ affected: 0 });
    await expect(
      service.resetPassword('a@b.com', '123456', 'New1!password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(otpRepository.delete).toHaveBeenCalledWith('otp-1');
  });

  it('deletes the code on the last wrong attempt', async () => {
    otpRepository.findOne.mockResolvedValue(record(2));
    execute.mockResolvedValue({ affected: 1 });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.resetPassword('a@b.com', '000000', 'New1!password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(otpRepository.delete).toHaveBeenCalledWith('otp-1');
  });

  it('keeps the code after an early wrong attempt', async () => {
    otpRepository.findOne.mockResolvedValue(record(0));
    execute.mockResolvedValue({ affected: 1 });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.resetPassword('a@b.com', '000000', 'New1!password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(otpRepository.delete).not.toHaveBeenCalled();
  });

  it('resets the password with a valid code', async () => {
    otpRepository.findOne.mockResolvedValue(record(0));
    execute.mockResolvedValue({ affected: 1 });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await service.resetPassword('a@b.com', '123456', 'New1!password');
    expect(usersService.resetPassword).toHaveBeenCalledWith(
      'u1',
      'New1!password',
    );
    expect(otpRepository.delete).toHaveBeenCalledWith({ email: 'a@b.com' });
  });

  it('rejects expired codes', async () => {
    otpRepository.findOne.mockResolvedValue({
      ...record(0),
      expiresAt: new Date(Date.now() - 1),
    });
    await expect(
      service.resetPassword('a@b.com', '123456', 'New1!password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(otpRepository.delete).toHaveBeenCalledWith('otp-1');
  });

  it('returns without waiting for the email and swallows send errors', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'u1', firstName: 'A' });
    mailService.sendPasswordResetOtpEmail.mockRejectedValue(new Error('down'));
    await expect(
      service.requestPasswordReset('A@B.com'),
    ).resolves.toBeUndefined();
  });

  it('does nothing for unknown emails', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await service.requestPasswordReset('nobody@b.com');
    expect(otpRepository.save).not.toHaveBeenCalled();
  });
});
