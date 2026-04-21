import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Database } from '@visiblefix/database';
import type { User as DbUser } from '@visiblefix/database/schema';
import { users } from '@visiblefix/database/schema';
import { DATABASE } from '../../common/database/database.module';
import type { UserRole } from '@visiblefix/shared/types';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findById(id: number) {
    const [user] = await this.database.select().from(users).where(eq(users.id, id)).limit(1);
    return user ? this.mapUser(user) : null;
  }

  async findByEmail(email: string) {
    const [user] = await this.database.select().from(users).where(eq(users.email, email)).limit(1);
    return user ? this.mapUser(user) : null;
  }

  async create(input: {
    email: string;
    name?: string | null;
    role: UserRole;
    passwordHash?: string | null;
    municipalityId?: number | null;
  }) {
    const [user] = await this.database
      .insert(users)
      .values({
        email: input.email,
        name: input.name ?? null,
        role: input.role,
        passwordHash: input.passwordHash ?? null,
        municipalityId: input.municipalityId ?? null,
      })
      .returning();

    return this.mapUser(user);
  }

  private mapUser(user: DbUser) {
    return {
      ...user,
      role: user.role as UserRole,
    };
  }
}
