import { BadRequestException, Body, Controller, Get, Headers, Inject, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import { APP_CONFIG, type ApplicationBootstrapOptions } from '../../app.config';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { clearCookie, readCookie, serializeCookie } from '../../common/auth/cookie.util';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './auth.constants';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const mobileRefreshSchema = z.object({
  refreshToken: z.string().min(16),
});

function shouldReturnMobileTokens(platform: string | undefined) {
  return platform?.toLowerCase() === 'mobile';
}

@Controller('auth')
export class AuthController {
  private readonly secureCookies: boolean;

  constructor(
    private readonly authService: AuthService,
    @Inject(APP_CONFIG) config: ApplicationBootstrapOptions
  ) {
    this.secureCookies = config.appEnv === 'production';
  }

  @Post('sign-in')
  async signIn(
    @Body() body: unknown,
    @Headers('user-agent') userAgent: string | undefined,
    @Headers('x-forwarded-for') forwardedFor: string | undefined,
    @Headers('x-client-platform') clientPlatform: string | undefined,
    @Res({ passthrough: true }) response: Response
  ) {
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }

    const session = await this.authService.signIn({
      ...parsed.data,
      userAgent,
      ipAddress: forwardedFor?.split(',')[0]?.trim(),
    });

    response.setHeader('Set-Cookie', [
      serializeCookie(ACCESS_TOKEN_COOKIE, session.accessToken, { maxAge: session.accessTtlSeconds, secure: this.secureCookies }),
      serializeCookie(REFRESH_TOKEN_COOKIE, session.refreshToken, { maxAge: session.refreshTtlSeconds, secure: this.secureCookies }),
    ]);

    const includeMobileTokens = shouldReturnMobileTokens(clientPlatform);

    return {
      success: true,
      data: session.user,
      ...(includeMobileTokens
        ? {
            meta: {
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
              accessTtlSeconds: session.accessTtlSeconds,
              refreshTtlSeconds: session.refreshTtlSeconds,
            },
          }
        : {}),
    };
  }

  @Post('sign-up')
  async signUp(
    @Body() body: unknown,
    @Headers('user-agent') userAgent: string | undefined,
    @Headers('x-forwarded-for') forwardedFor: string | undefined,
    @Headers('x-client-platform') clientPlatform: string | undefined,
    @Res({ passthrough: true }) response: Response
  ) {
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }

    const session = await this.authService.signUp({
      ...parsed.data,
      userAgent,
      ipAddress: forwardedFor?.split(',')[0]?.trim(),
    });

    response.setHeader('Set-Cookie', [
      serializeCookie(ACCESS_TOKEN_COOKIE, session.accessToken, { maxAge: session.accessTtlSeconds, secure: this.secureCookies }),
      serializeCookie(REFRESH_TOKEN_COOKIE, session.refreshToken, { maxAge: session.refreshTtlSeconds, secure: this.secureCookies }),
    ]);

    const includeMobileTokens = shouldReturnMobileTokens(clientPlatform);

    return {
      success: true,
      data: session.user,
      ...(includeMobileTokens
        ? {
            meta: {
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
              accessTtlSeconds: session.accessTtlSeconds,
              refreshTtlSeconds: session.refreshTtlSeconds,
            },
          }
        : {}),
    };
  }

  @Post('refresh')
  async refresh(
    @Body() body: unknown,
    @Headers('cookie') cookieHeader: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Headers('x-forwarded-for') forwardedFor: string | undefined,
    @Headers('x-client-platform') clientPlatform: string | undefined,
    @Res({ passthrough: true }) response: Response
  ) {
    const includeMobileTokens = shouldReturnMobileTokens(clientPlatform);
    const mobileBody = mobileRefreshSchema.safeParse(body);
    const refreshToken = includeMobileTokens && mobileBody.success ? mobileBody.data.refreshToken : readCookie(cookieHeader, REFRESH_TOKEN_COOKIE);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const session = await this.authService.refresh(refreshToken, {
      userAgent,
      ipAddress: forwardedFor?.split(',')[0]?.trim(),
    });

    response.setHeader('Set-Cookie', [
      serializeCookie(ACCESS_TOKEN_COOKIE, session.accessToken, { maxAge: session.accessTtlSeconds, secure: this.secureCookies }),
      serializeCookie(REFRESH_TOKEN_COOKIE, session.refreshToken, { maxAge: session.refreshTtlSeconds, secure: this.secureCookies }),
    ]);

    return {
      success: true,
      data: session.user,
      ...(includeMobileTokens
        ? {
            meta: {
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
              accessTtlSeconds: session.accessTtlSeconds,
              refreshTtlSeconds: session.refreshTtlSeconds,
            },
          }
        : {}),
    };
  }

  @Post('sign-out')
  async signOut(
    @Body() body: unknown,
    @Headers('cookie') cookieHeader: string | undefined,
    @Headers('x-client-platform') clientPlatform: string | undefined,
    @Res({ passthrough: true }) response: Response
  ) {
    const includeMobileTokens = shouldReturnMobileTokens(clientPlatform);
    const mobileBody = mobileRefreshSchema.safeParse(body);
    const refreshToken = includeMobileTokens && mobileBody.success ? mobileBody.data.refreshToken : readCookie(cookieHeader, REFRESH_TOKEN_COOKIE);

    await this.authService.signOut(refreshToken);

    response.setHeader('Set-Cookie', [
      clearCookie(ACCESS_TOKEN_COOKIE, { secure: this.secureCookies }),
      clearCookie(REFRESH_TOKEN_COOKIE, { secure: this.secureCookies }),
    ]);

    return {
      success: true,
      data: { signedOut: true },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: RequestUser) {
    return {
      success: true,
      data: await this.authService.getCurrentUser(user),
    };
  }
}
