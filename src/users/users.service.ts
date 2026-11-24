import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Raw, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { ACCOUNT_DELETION_GRACE_DAYS } from './constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import type { UserPublic } from './types/user-public';
import { normalizeEmail } from '../common/validation/normalize-email';
import type { Pagination } from '../common/dto/pagination-query.dto';

/** Increments the session version so every outstanding access/refresh token stops working. */
const BUMP_TOKEN_VERSION = () => '"token_version" + 1';

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
    const email = normalizeEmail(createUserDto.email);
    // Case-insensitive duplicate check (covers legacy mixed-case rows and soft-deleted accounts).
    const existing = await this.usersRepository.findOne({
      where: { email: this.emailEquals(email) },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash: string = await bcrypt.hash(createUserDto.password, 10);
    const user: User = this.usersRepository.create({
      email,
      passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
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

  async findAll(pagination?: Pagination): Promise<User[]> {
    return this.usersRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      skip: pagination?.skip,
      take: pagination?.take,
    });
  }

  /** Case-insensitive lookup; matches legacy rows stored with mixed-case emails. */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        email: this.emailEquals(normalizeEmail(email)),
        deletedAt: IsNull(),
      },
    });
  }

  private emailEquals(normalized: string) {
    return Raw((alias) => `LOWER(${alias}) = :normalizedEmail`, {
      normalizedEmail: normalized,
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
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
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
      tokenVersion: BUMP_TOKEN_VERSION,
    });

    const scheduledPermanentDeletionAt = new Date(deletedAt);
    scheduledPermanentDeletionAt.setUTCDate(
      scheduledPermanentDeletionAt.getUTCDate() + ACCOUNT_DELETION_GRACE_DAYS,
    );

    return {
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

    await this.setPasswordAndRevokeSessions(userId, newPassword);
  }

  /** Password reset via OTP — revokes all existing access and refresh tokens. */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await this.setPasswordAndRevokeSessions(userId, newPassword);
  }

  private async setPasswordAndRevokeSessions(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      passwordHash: await bcrypt.hash(newPassword, 10),
      refreshTokenHash: null,
      tokenVersion: BUMP_TOKEN_VERSION,
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
