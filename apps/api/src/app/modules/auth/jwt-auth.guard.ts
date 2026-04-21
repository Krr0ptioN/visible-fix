import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { readCookie } from '../../common/auth/cookie.util';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { ACCESS_TOKEN_COOKIE } from './auth.constants';
import { TokenService } from './token.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const authorization = request.headers.authorization;
    const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    const cookieToken = readCookie(request.headers.cookie, ACCESS_TOKEN_COOKIE);
    const token = bearerToken ?? cookieToken;

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const payload = this.tokenService.verifyAccessToken(token);
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      municipalityId: user.municipalityId,
    };

    return true;
  }
}
