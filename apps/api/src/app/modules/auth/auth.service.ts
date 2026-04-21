import { ConflictException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '@visiblefix/shared/types';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { AuthSessionRepository } from './auth-session.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();

    if (!email || !password) {
      return;
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      return;
    }

    const passwordHash = await this.passwordService.hash(password);
    await this.usersService.create({
      email,
      name: process.env.ADMIN_NAME?.trim() || 'VisibleFix Admin',
      role: 'admin',
      passwordHash,
    });
  }

  async signIn(input: {
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    const user = await this.usersService.findByEmail(input.email.trim().toLowerCase());

    if (!user || !user.passwordHash || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await this.passwordService.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueSession(user, {
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });
  }

  async signUp(input: {
    name?: string | null;
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await this.passwordService.hash(input.password);
    const user = await this.usersService.create({
      email,
      name: input.name?.trim() || null,
      role: 'citizen',
      passwordHash,
    });

    return this.issueSession(user, {
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });
  }

  async refresh(refreshToken: string, clientInfo?: { userAgent?: string | null; ipAddress?: string | null }) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const refreshTokenHash = this.tokenService.hashToken(refreshToken);
    const session = await this.authSessionRepository.findActiveByRefreshTokenHash(refreshTokenHash);

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Session not found');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    await this.authSessionRepository.revokeByRefreshTokenHash(refreshTokenHash);

    return this.issueSession(user, clientInfo);
  }

  async signOut(refreshToken: string | undefined) {
    if (!refreshToken) {
      return;
    }

    await this.authSessionRepository.revokeByRefreshTokenHash(this.tokenService.hashToken(refreshToken));
  }

  async getCurrentUser(user: RequestUser): Promise<AuthUser> {
    const currentUser = await this.usersService.findById(user.id);
    if (!currentUser || !currentUser.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return this.usersService.toAuthUser(currentUser);
  }

  private async issueSession(
    user: {
      id: number;
      email: string;
      name: string | null;
      role: AuthUser['role'];
      municipalityId: number | null;
    },
    clientInfo?: { userAgent?: string | null; ipAddress?: string | null }
  ) {
    const accessToken = this.tokenService.signAccessToken(user);
    const refreshToken = this.tokenService.signRefreshToken(user);
    const refreshTokenHash = this.tokenService.hashToken(refreshToken);
    const refreshTtlSeconds = this.tokenService.refreshTtlSeconds();

    await this.authSessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      userAgent: clientInfo?.userAgent,
      ipAddress: clientInfo?.ipAddress,
      expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
    });

    return {
      user: this.usersService.toAuthUser(user),
      accessToken,
      refreshToken,
      accessTtlSeconds: this.tokenService.accessTtlSeconds(),
      refreshTtlSeconds,
    };
  }
}
