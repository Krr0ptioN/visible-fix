import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import type { Database } from '@visiblefix/database';
import { issues, upvotes } from '@visiblefix/database/schema';
import { DATABASE } from '../../common/database/database.module';

@Injectable()
export class UpvotesRepository {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async countByIssueId(issueId: number) {
    const [result] = await this.database.select({ total: count() }).from(upvotes).where(eq(upvotes.issueId, issueId));
    return Number(result?.total ?? 0);
  }

  async findByIssueId(issueId: number) {
    return this.database.select().from(upvotes).where(eq(upvotes.issueId, issueId));
  }

  async create(input: { issueId: number; deviceId: string }) {
    const [issue] = await this.database.select({ id: issues.id }).from(issues).where(eq(issues.id, input.issueId)).limit(1);
    if (!issue) {
      return null;
    }

    const [created] = await this.database
      .insert(upvotes)
      .values({ issueId: input.issueId, deviceId: input.deviceId })
      .onConflictDoNothing({ target: [upvotes.issueId, upvotes.deviceId] })
      .returning();

    if (created) {
      return created;
    }

    const [existing] = await this.database
      .select()
      .from(upvotes)
      .where(and(eq(upvotes.issueId, input.issueId), eq(upvotes.deviceId, input.deviceId)))
      .limit(1);

    return existing ?? null;
  }

  async deleteById(id: number) {
    const [deleted] = await this.database.delete(upvotes).where(eq(upvotes.id, id)).returning();
    return deleted ?? null;
  }
}
