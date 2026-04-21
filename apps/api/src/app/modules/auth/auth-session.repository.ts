import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { Database } from '@visiblefix/database';
import { authSessions } from '@visiblefix/database/schema';
import { DATABASE } from '../../common/database/database.module';

@Injectable()
export class AuthSessionRepository {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async create(input: {
    userId: number;
    refreshTokenHash: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }) {
    const [session] = await this.database
      .insert(authSessions)
      .values({
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
        expiresAt: input.expiresAt,
      })
      .returning();

    return session;
  }

  async findActiveByRefreshTokenHash(refreshTokenHash: string) {
    const [session] = await this.database
      .select()
      .from(authSessions)
      .where(
        and(
          eq(authSessions.refreshTokenHash, refreshTokenHash),
          isNull(authSessions.revokedAt),
          gt(authSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    return session ?? null;
  }

  async revokeByRefreshTokenHash(refreshTokenHash: string) {
    const [session] = await this.database
      .update(authSessions)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(authSessions.refreshTokenHash, refreshTokenHash))
      .returning();

    return session ?? null;
  }
}
