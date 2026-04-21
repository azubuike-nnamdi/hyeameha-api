import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DatabaseError } from 'pg';
import { QueryFailedError } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  const qbExecute = jest.fn().mockResolvedValue({ affected: 0 });
  const qbChain = {
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: qbExecute,
  };
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => qbChain),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  const createDto = {
    email: 'a@b.com',
    password: 'Secure1!Pwd',
    firstName: 'A',
    lastName: 'B',
    phone: '15551234567',
  };

  it('creates user with hashed password', async () => {
    repository.create.mockReturnValue({ email: 'a@b.com' });
    repository.save.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash: 'hashed',
      firstName: 'A',
      lastName: 'B',
      phone: '15551234567',
      deletedAt: null,
      refreshTokenHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await service.create(createDto);
    expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    expect(result.id).toBe('u1');
  });

  it('throws ConflictException on duplicate email', async () => {
    repository.create.mockReturnValue({});
    const pgErr = new DatabaseError('duplicate key', 0, 'error');
    pgErr.code = '23505';
    repository.save.mockRejectedValue(new QueryFailedError('', [], pgErr));
    await expect(service.create(createDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('finds all non-deleted users', async () => {
    repository.find.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        phone: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(repository.find).toHaveBeenCalled();
  });

  it('finds by email', async () => {
    repository.findOne.mockResolvedValue({ id: 'u1' });
    await service.findByEmail('a@b.com');
    expect(repository.findOne).toHaveBeenCalled();
  });

  it('updates active user and returns refreshed row', async () => {
    repository.update.mockResolvedValue({ affected: 1 });
    repository.findOne.mockResolvedValue({
      id: 'u1',
      firstName: 'N',
      email: 'a@b.com',
      lastName: 'B',
      phone: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await service.update('u1', { firstName: 'N' });
    expect(repository.update).toHaveBeenCalled();
    expect(result?.firstName).toBe('N');
  });

  it('returns null when update matches no row', async () => {
    repository.update.mockResolvedValue({ affected: 0 });
    const result = await service.update('u1', { firstName: 'N' });
    expect(result).toBeNull();
  });

  it('requests account deletion (soft delete)', async () => {
    repository.findOne.mockResolvedValueOnce({
      id: 'u1',
      email: 'a@b.com',
      deletedAt: null,
    });
    repository.update.mockResolvedValue({ affected: 1 });
    const result = await service.requestAccountDeletion('u1');
    expect(repository.update).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ refreshTokenHash: null }),
    );
    type AccountDeletionUpdate = [
      id: string,
      payload: { deletedAt: Date; refreshTokenHash: null },
    ];
    const firstUpdate = jest.mocked(repository.update).mock.calls[0] as
      | AccountDeletionUpdate
      | undefined;
    expect(firstUpdate).toBeDefined();
    expect(firstUpdate?.[1].deletedAt).toBeInstanceOf(Date);
    expect(result.gracePeriodDays).toBe(7);
    expect(result.scheduledPermanentDeletionAt).toBeInstanceOf(Date);
  });

  it('sets and clears refresh token hash', async () => {
    repository.update.mockResolvedValue({ affected: 1 });
    await service.setRefreshTokenHash('u1', 'hash');
    await service.clearRefreshTokenHash('u1');
    expect(repository.update).toHaveBeenNthCalledWith(1, 'u1', {
      refreshTokenHash: 'hash',
    });
    expect(repository.update).toHaveBeenNthCalledWith(2, 'u1', {
      refreshTokenHash: null,
    });
  });

  it('changePassword rejects wrong password', async () => {
    repository.findOne.mockResolvedValue({
      id: 'u1',
      passwordHash: 'h',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.changePassword('u1', 'wrong', 'newpass12345'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('changePassword updates hash on success', async () => {
    repository.findOne.mockResolvedValue({
      id: 'u1',
      passwordHash: 'h',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    repository.update.mockResolvedValue({ affected: 1 });
    await service.changePassword('u1', 'old', 'newpass12345');
    expect(repository.update).toHaveBeenCalled();
  });

  it('purges soft-deleted users past grace via query builder', async () => {
    await service.purgeSoftDeletedUsersPastGracePeriod();
    expect(repository.createQueryBuilder).toHaveBeenCalled();
    expect(qbExecute).toHaveBeenCalled();
  });
});
