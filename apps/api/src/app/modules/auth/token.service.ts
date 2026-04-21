import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import type { UserRole } from '@visiblefix/shared/types';

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

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be configured.`);
  }
  return value;
}

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
  constructor(private readonly jwtService: JwtService) {}

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
      secret: getRequiredEnv('JWT_ACCESS_SECRET'),
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
      secret: getRequiredEnv('JWT_REFRESH_SECRET'),
      expiresIn: this.refreshTtlSeconds(),
    });
  }

  verifyAccessToken(token: string) {
    const payload = this.jwtService.verify<AccessTokenPayload>(token, {
      secret: getRequiredEnv('JWT_ACCESS_SECRET'),
    });

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    return payload;
  }

  verifyRefreshToken(token: string) {
    const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
      secret: getRequiredEnv('JWT_REFRESH_SECRET'),
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
    const raw = process.env.JWT_REFRESH_TTL_SECONDS ?? process.env.JWT_REFRESH_TTL;
    return parseDurationToSeconds(raw, 60 * 60 * 24 * 30);
  }

  accessTtlSeconds() {
    const raw = process.env.JWT_ACCESS_TTL_SECONDS ?? process.env.JWT_ACCESS_TTL;
    return parseDurationToSeconds(raw, 60 * 15);
  }
}
