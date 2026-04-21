import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadUser } from '../types/jwt-payload-user';

/** Generics wire `FactoryOutput` so the decorator is not typed as `any` (fixes no-unsafe-* in callers). */
export const CurrentUser = createParamDecorator<unknown, JwtPayloadUser>(
  (_data: unknown, ctx: ExecutionContext): JwtPayloadUser => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayloadUser }>();
    return request.user;
  },
);
