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
import { PasswordResetOtp } from './entities/password-reset-otp.entity';

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

  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      try {
        await this.createAndSendOtp(user.id, normalizedEmail, user.firstName);
      } catch (error: unknown) {
        this.logger.error(
          `Password reset OTP email failed for ${normalizedEmail}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return;
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    const normalizedEmail = email.trim();
    const record = await this.otpRepository.findOne({
      where: { email: normalizedEmail },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      if (record) {
        await this.otpRepository.delete(record.id);
      }
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const valid = await bcrypt.compare(otp, record.otpHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired verification code');
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
