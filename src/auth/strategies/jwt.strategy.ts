import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { toJwtPayloadUser } from '../mappers/jwt-payload-user.mapper';
import type { JwtPayloadUser } from '../types/jwt-payload-user';

type JwtPayload = {
  sub: string;
  email: string;
  /** Session version; tokens issued before a password change/reset are rejected. */
  ver?: number;
  typ?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayloadUser> {
    if (payload.typ === 'refresh') {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findByIdPublicOrNull(payload.sub);
    if (!user || (payload.ver ?? 0) !== user.tokenVersion) {
      throw new UnauthorizedException();
    }
    return toJwtPayloadUser(user);
  }
}
