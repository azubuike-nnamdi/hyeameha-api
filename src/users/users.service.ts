import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { ACCOUNT_DELETION_GRACE_DAYS } from './constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import type { UserPublic } from './types/user-public';

/**
 * UsersService for the Hyeameha API: persistence for `User` entities and a thin
 * abstraction over TypeORM so Auth and other modules do not depend on DB details.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const passwordHash: string = await bcrypt.hash(createUserDto.password, 10);
    const user: User = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });
    try {
      return await this.usersRepository.save(user);
    } catch (e) {
      if (this.isUniqueViolation(e)) {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }

  private isUniqueViolation(e: unknown): boolean {
    if (!(e instanceof QueryFailedError)) {
      return false;
    }
    return UsersService.isPostgresUniqueViolation(e.driverError);
  }

  /** Postgres `23505` = unique_violation (driver error shape varies by client). */
  private static isPostgresUniqueViolation(driverError: unknown): boolean {
    if (typeof driverError !== 'object' || driverError === null) {
      return false;
    }
    if (!('code' in driverError)) {
      return false;
    }
    const { code } = driverError;
    return code === '23505';
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { deletedAt: IsNull() },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  private toUserPublic(user: User): UserPublic {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByIdPublicOrNull(id: string): Promise<UserPublic | null> {
    const user = await this.findOne(id);
    return user ? this.toUserPublic(user) : null;
  }

  async findProfileById(id: string): Promise<UserPublic | null> {
    return this.findByIdPublicOrNull(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserPublic | null> {
    const result = await this.usersRepository.update(
      { id, deletedAt: IsNull() },
      updateUserDto,
    );
    if (!result.affected) {
      return null;
    }
    const user = await this.findOne(id);
    return user ? this.toUserPublic(user) : null;
  }

  /**
   * Soft-delete: sets `deletedAt`, clears refresh token hash. User cannot authenticate;
   * row is permanently removed after the grace period by a scheduled job.
   */
  async requestAccountDeletion(userId: string): Promise<{
    message: string;
    scheduledPermanentDeletionAt: Date;
    gracePeriodDays: number;
  }> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedAt = new Date();
    await this.usersRepository.update(userId, {
      deletedAt,
      refreshTokenHash: null,
    });

    const scheduledPermanentDeletionAt = new Date(deletedAt);
    scheduledPermanentDeletionAt.setUTCDate(
      scheduledPermanentDeletionAt.getUTCDate() + ACCOUNT_DELETION_GRACE_DAYS,
    );

    return {
      message:
        'Your account is scheduled for permanent deletion. You will not be able to sign in. Your data is retained for 7 days; after that it will be permanently removed and cannot be recovered.',
      scheduledPermanentDeletionAt,
      gracePeriodDays: ACCOUNT_DELETION_GRACE_DAYS,
    };
  }

  async validatePassword(
    user: { passwordHash: string },
    plainPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, user.passwordHash);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersRepository.update(userId, {
      passwordHash: await bcrypt.hash(newPassword, 10),
    });
  }

  /** Called daily by UsersPurgeCron. */
  async purgeSoftDeletedUsersPastGracePeriod(): Promise<void> {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - ACCOUNT_DELETION_GRACE_DAYS);

    const result = await this.usersRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('"deleted_at" IS NOT NULL')
      .andWhere('"deleted_at" <= :cutoff', { cutoff })
      .execute();

    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(
        `Permanently removed ${affected} soft-deleted user account(s) past grace period`,
      );
    }
  }

  async setRefreshTokenHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, { refreshTokenHash });
  }

  async clearRefreshTokenHash(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshTokenHash: null });
  }
}
