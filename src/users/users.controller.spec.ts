import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    findProfileById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    requestAccountDeletion: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  const jwtUser = { sub: 'u1', email: 'a@b.com', role: 'user' as const };

  it('returns current user for me()', async () => {
    usersService.findProfileById.mockResolvedValue({
      id: 'u1',
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      phone: null,
      role: 'user',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await controller.me(jwtUser);
    expect(result.statusCode).toBe(200);
    expect(result.data.id).toBe('u1');
    expect(
      (result.data as { passwordHash?: string }).passwordHash,
    ).toBeUndefined();
  });

  it('throws when me() user missing', async () => {
    usersService.findProfileById.mockResolvedValue(null);
    await expect(controller.me(jwtUser)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns sanitized users list', async () => {
    usersService.findAll.mockResolvedValue([
      {
        id: 'u1',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        phone: null,
        role: 'user',
        passwordHash: 'hidden',
        deletedAt: null,
        refreshTokenHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await controller.findAll();
    expect(result.data).toHaveLength(1);
    expect(
      (result.data[0] as { passwordHash?: string }).passwordHash,
    ).toBeUndefined();
  });

  it('updates current user', async () => {
    usersService.update.mockResolvedValue({
      id: 'u1',
      firstName: 'N',
      lastName: 'B',
      email: 'a@b.com',
      phone: null,
      role: 'user',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await controller.update(jwtUser, { firstName: 'N' });
    expect(result.data.firstName).toBe('N');
  });

  it('throws when update target not found', async () => {
    usersService.update.mockResolvedValue(null);
    await expect(
      controller.update(jwtUser, { firstName: 'N' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('change password delegates to service', async () => {
    usersService.changePassword.mockResolvedValue(undefined);
    const result = await controller.changePassword(jwtUser, {
      currentPassword: 'old',
      newPassword: 'newpass12',
    });
    expect(usersService.changePassword).toHaveBeenCalledWith(
      'u1',
      'old',
      'newpass12',
    );
    expect(result.data).toBeNull();
    expect(result.message).toBe('Password updated successfully');
  });

  it('requests account deletion for current user', async () => {
    usersService.requestAccountDeletion.mockResolvedValue({
      scheduledPermanentDeletionAt: new Date(),
      gracePeriodDays: 7,
    });
    const result = await controller.remove(jwtUser);
    expect(usersService.requestAccountDeletion).toHaveBeenCalledWith('u1');
    expect(result.data.gracePeriodDays).toBe(7);
  });
});
