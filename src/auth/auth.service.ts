import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthRefreshDataDto,
  AuthSessionDataDto,
} from './dto/auth-api-response.dto';
import { toPublicUser } from '../users/types/public-user';
import type { LoginContext } from './utils/login-context.util';

type RefreshJwtPayload = {
  sub: string;
  email: string;
  typ?: string;
};

/** Register and login both issue access + refresh tokens (refresh hash stored in DB). */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSessionDataDto> {
    const createUserDto: CreateUserDto = {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    };
    const user: User = await this.usersService.create(createUserDto);
    const response = await this.buildRegisterResponse(
      user.id,
      user.email,
      user,
    );
    this.sendWelcomeEmailSafe(user.email, user.firstName, user.id);
    return response;
  }

  async login(
    dto: LoginDto,
    context: LoginContext,
  ): Promise<AuthSessionDataDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await this.usersService.validatePassword(user, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const response = await this.buildLoginResponse(user);
    this.sendLoginAlertSafe(user.email, user.firstName, context);
    return response;
  }

  async refresh(refreshToken: string): Promise<AuthRefreshDataDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findOne(payload.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const tokens = await this.issueTokenPair(user.id, user.email);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private sendWelcomeEmailSafe(
    email: string,
    firstName: string,
    userId: string,
  ): void {
    void this.mailService
      .sendWelcomeEmail(email, firstName, userId)
      .catch((error: unknown) => {
        const detail = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Welcome email not sent to ${email}: ${detail}. ` +
            'Check MAIL_FROM is a verified sender in Altermail and server logs.',
        );
      });
  }

  private sendLoginAlertSafe(
    email: string,
    firstName: string,
    context: LoginContext,
  ): void {
    void this.mailService
      .sendLoginAlertEmail(email, firstName, context)
      .catch((error: unknown) => {
        this.logger.warn(
          `Login alert email failed for ${email}`,
          error instanceof Error ? error.message : String(error),
        );
      });
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(
        refreshToken,
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
      if (payload.typ !== 'refresh') {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      return payload;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async buildLoginResponse(user: User): Promise<AuthSessionDataDto> {
    const { accessToken, refreshToken } = await this.issueTokenPair(
      user.id,
      user.email,
    );
    return {
      accessToken,
      refreshToken,
      user: {
        ...toPublicUser(user),
        id: user.id,
      },
    };
  }

  private async buildRegisterResponse(
    userId: string,
    email: string,
    user: User,
  ): Promise<AuthSessionDataDto> {
    const { accessToken, refreshToken } = await this.issueTokenPair(
      userId,
      email,
    );
    return {
      accessToken,
      refreshToken,
      user: {
        ...toPublicUser(user),
        id: user.id,
      },
    };
  }

  private async issueTokenPair(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.signAccessToken(userId, email);
    const refreshToken = await this.signRefreshToken(userId, email);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshTokenHash(userId, refreshTokenHash);
    return { accessToken, refreshToken };
  }

  private signAccessToken(userId: string, email: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, email });
  }

  private signRefreshToken(userId: string, email: string): Promise<string> {
    const signOptions = {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
    } as JwtSignOptions;
    return this.jwtService.signAsync(
      { sub: userId, email, typ: 'refresh' },
      signOptions,
    );
  }
}
