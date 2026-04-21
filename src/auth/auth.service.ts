import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AUTH_LOGIN_SUCCESS_MESSAGE,
  AUTH_REGISTER_SUCCESS_MESSAGE,
} from './auth.messages';
import { RegisterResponseDto } from './dto/auth-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { toPublicUser } from '../users/types/public-user';

/**
 * Register issues access + refresh tokens; login issues access token only.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const createUserDto: CreateUserDto = {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    };
    const user: User = await this.usersService.create(createUserDto);
    return this.buildRegisterResponse(user.id, user.email, user);
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await this.usersService.validatePassword(user, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = await this.signAccessToken(user.id, user.email);
    return {
      message: AUTH_LOGIN_SUCCESS_MESSAGE,
      accessToken,
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
  ): Promise<RegisterResponseDto> {
    const accessToken = await this.signAccessToken(userId, email);
    const refreshToken = await this.signRefreshToken(userId, email);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshTokenHash(userId, refreshTokenHash);
    return {
      message: AUTH_REGISTER_SUCCESS_MESSAGE,
      accessToken,
      refreshToken,
      user: {
        ...toPublicUser(user),
        id: user.id,
      },
    };
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
