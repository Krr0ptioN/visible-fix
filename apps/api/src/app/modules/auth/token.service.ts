import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import type { UserRole } from '@visiblefix/shared/types';
import { APP_CONFIG, type ApplicationBootstrapOptions } from '../../app.config';

type AccessTokenPayload = {
  sub: number;
  email: string;
  role: UserRole;
  municipalityId: number | null;
  type: 'access';
};

type RefreshTokenPayload = {
  sub: number;
  email: string;
  type: 'refresh';
};

function parseDurationToSeconds(value: string | undefined, fallbackSeconds: number) {
  if (!value?.trim()) {
    return fallbackSeconds;
  }

  const normalized = value.trim().toLowerCase();
  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  const match = normalized.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration value "${value}". Use seconds or <number>s|m|h|d.`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      return fallbackSeconds;
  }
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(APP_CONFIG) private readonly config: ApplicationBootstrapOptions
  ) {}

  signAccessToken(user: {
    id: number;
    email: string;
    role: UserRole;
    municipalityId: number | null;
  }) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      municipalityId: user.municipalityId,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.config.auth.jwtAccessSecret,
      expiresIn: this.accessTtlSeconds(),
    });
  }

  signRefreshToken(user: { id: number; email: string }) {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.config.auth.jwtRefreshSecret,
      expiresIn: this.refreshTtlSeconds(),
    });
  }

  verifyAccessToken(token: string) {
    const payload = this.jwtService.verify<AccessTokenPayload>(token, {
      secret: this.config.auth.jwtAccessSecret,
    });

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    return payload;
  }

  verifyRefreshToken(token: string) {
    const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
      secret: this.config.auth.jwtRefreshSecret,
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  refreshTtlSeconds() {
    return typeof this.config.auth.jwtRefreshTtl === 'number'
      ? this.config.auth.jwtRefreshTtl
      : parseDurationToSeconds(this.config.auth.jwtRefreshTtl, 60 * 60 * 24 * 30);
  }

  accessTtlSeconds() {
    return typeof this.config.auth.jwtAccessTtl === 'number'
      ? this.config.auth.jwtAccessTtl
      : parseDurationToSeconds(this.config.auth.jwtAccessTtl, 60 * 15);
  }
}
