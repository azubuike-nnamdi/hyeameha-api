import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { normalizeEmail } from '../common/validation/normalize-email';
import { PasswordResetOtp } from './entities/password-reset-otp.entity';

const INVALID_CODE_MESSAGE = 'Invalid or expired verification code';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(PasswordResetOtp)
    private readonly otpRepository: Repository<PasswordResetOtp>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Always resolves the same way. The OTP is created and emailed in the background so
   * response time does not reveal whether an account exists.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      void this.createAndSendOtp(
        user.id,
        normalizedEmail,
        user.firstName,
      ).catch((error: unknown) => {
        this.logger.error(
          'Password reset OTP email failed',
          error instanceof Error ? error.stack : String(error),
        );
      });
    }
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const record = await this.otpRepository.findOne({
      where: { email: normalizedEmail },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      if (record) {
        await this.otpRepository.delete(record.id);
      }
      throw new UnauthorizedException(INVALID_CODE_MESSAGE);
    }

    // Reserve an attempt atomically before comparing, so parallel guesses cannot
    // exceed the limit.
    const maxAttempts = this.config.get<number>(
      'PASSWORD_RESET_OTP_MAX_ATTEMPTS',
      5,
    );
    const reserved = await this.otpRepository
      .createQueryBuilder()
      .update(PasswordResetOtp)
      .set({ attempts: () => '"attempts" + 1' })
      .where('id = :id', { id: record.id })
      .andWhere('"attempts" < :maxAttempts', { maxAttempts })
      .execute();
    if (!reserved.affected) {
      await this.otpRepository.delete(record.id);
      throw new UnauthorizedException(INVALID_CODE_MESSAGE);
    }

    const valid = await bcrypt.compare(otp, record.otpHash);
    if (!valid) {
      if (record.attempts + 1 >= maxAttempts) {
        await this.otpRepository.delete(record.id);
      }
      throw new UnauthorizedException(INVALID_CODE_MESSAGE);
    }

    await this.usersService.resetPassword(record.userId, newPassword);
    await this.otpRepository.delete({ email: normalizedEmail });
  }

  private async createAndSendOtp(
    userId: string,
    email: string,
    firstName: string,
  ): Promise<void> {
    await this.otpRepository.delete({ email });

    const otp = this.generateOtp();
    const expiresMinutes = this.config.get<number>(
      'PASSWORD_RESET_OTP_EXPIRES_MINUTES',
      15,
    );
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresMinutes);

    const entity = this.otpRepository.create({
      userId,
      email,
      otpHash: await bcrypt.hash(otp, 10),
      expiresAt,
    });
    await this.otpRepository.save(entity);

    await this.mailService.sendPasswordResetOtpEmail(
      email,
      firstName,
      otp,
      expiresMinutes,
      userId,
    );
  }

  private generateOtp(): string {
    const length = this.config.get<number>('PASSWORD_RESET_OTP_LENGTH', 6);
    if (length < 4 || length > 8) {
      throw new BadRequestException('Invalid OTP length configuration');
    }
    const max = 10 ** length;
    const code = randomInt(0, max);
    return code.toString().padStart(length, '0');
  }
}
