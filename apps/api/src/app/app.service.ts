import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@visiblefix/database';
import { issues, upvotes } from '@visiblefix/database/schema';
import type { IssueCategory, IssueStatus } from '@visiblefix/shared/types';

const listIssuesQuerySchema = z.object({
  status: z.enum(['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected']).optional(),
  category: z.enum(['pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createIssueSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(2000).optional(),
  category: z.enum(['pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other']),
  imageUrl: z.string().url().optional(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().max(500).optional(),
  deviceId: z.string().min(1).max(100),
});

const updateIssueStatusSchema = z.object({
  status: z.enum(['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected']),
  note: z.string().max(2000).optional(),
});

const upvoteBodySchema = z.object({
  issueId: z.coerce.number().int().positive(),
  deviceId: z.string().min(1).max(100),
});

const searchIssuesQuerySchema = z.object({
  q: z.string().min(2).max(200),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

type DbIssue = typeof issues.$inferSelect;
type DbUpvote = typeof upvotes.$inferSelect;

type ApiIssue = {
  id: string;
  title: string;
  description: string | null;
  category: IssueCategory;
  status: IssueStatus;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  reportedAt: string;
  acknowledgedAt: string | null;
  inProgressAt: string | null;
  resolvedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  upvoteCount: number;
  cityId: string | null;
};

type ApiUpvote = {
  id: string;
  issueId: string;
  deviceId: string;
  createdAt: string;
};

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'VisibleFix API' };
  }

  getHealth() {
    return { status: 'ok' as const };
  }

  async getIssues(rawQuery: unknown) {
    const parsed = this.parseOrBadRequest(listIssuesQuerySchema, rawQuery ?? {});
    const offset = (parsed.page - 1) * parsed.limit;

    const conditions = [];
    if (parsed.status) conditions.push(eq(issues.status, parsed.status));
    if (parsed.category) conditions.push(eq(issues.category, parsed.category));

    const rows = conditions.length
      ? await db.select().from(issues).where(and(...conditions)).orderBy(desc(issues.createdAt)).limit(parsed.limit).offset(offset)
      : await db.select().from(issues).orderBy(desc(issues.createdAt)).limit(parsed.limit).offset(offset);

    const totalResult = conditions.length
      ? await db.select({ total: count() }).from(issues).where(and(...conditions))
      : await db.select({ total: count() }).from(issues);

    const total = Number(totalResult[0]?.total ?? 0);
    const data = await Promise.all(rows.map((row) => this.mapIssue(row)));

    return {
      success: true,
      data,
      meta: {
        page: parsed.page,
        limit: parsed.limit,
        total,
        hasMore: offset + rows.length < total,
      },
    };
  }

  async getIssueById(id: string) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new BadRequestException('Invalid issue id');
    }

    const [issue] = await db.select().from(issues).where(eq(issues.id, numericId)).limit(1);
    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return {
      success: true,
      data: await this.mapIssue(issue),
    };
  }

  async createIssue(payload: unknown) {
    const parsed = this.parseOrBadRequest(createIssueSchema, payload);

    const [created] = await db
      .insert(issues)
      .values({
        title: parsed.title,
        description: parsed.description,
        category: parsed.category,
        status: 'reported',
        imageUrl: parsed.imageUrl,
        latitude: Math.round(parsed.latitude * 1_000_000),
        longitude: Math.round(parsed.longitude * 1_000_000),
        address: parsed.address,
        municipalityId: 1,
        deviceId: parsed.deviceId,
      })
      .returning();

    return {
      success: true,
      data: await this.mapIssue(created),
    };
  }

  async updateIssueStatus(id: string, payload: unknown) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new BadRequestException('Invalid issue id');
    }

    const parsed = this.parseOrBadRequest(updateIssueStatusSchema, payload);
    const now = new Date();

    const [updated] = await db
      .update(issues)
      .set({
        status: parsed.status,
        acknowledgedAt: parsed.status === 'acknowledged' ? now : undefined,
        inProgressAt: parsed.status === 'in_progress' ? now : undefined,
        resolvedAt: parsed.status === 'resolved' ? now : undefined,
        rejectedAt: parsed.status === 'rejected' ? now : undefined,
        rejectReason: parsed.status === 'rejected' ? parsed.note ?? null : undefined,
        updatedAt: now,
      })
      .where(eq(issues.id, numericId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Issue not found');
    }

    return {
      success: true,
      data: await this.mapIssue(updated),
    };
  }

  async searchIssues(query: string, limitRaw: unknown = undefined) {
    const parsed = this.parseOrBadRequest(searchIssuesQuerySchema, {
      q: query,
      limit: limitRaw,
    });
    const q = `%${parsed.q.trim()}%`;
    const rows = await db
      .select()
      .from(issues)
      .where(and(ilike(issues.title, q)))
      .orderBy(desc(issues.createdAt))
      .limit(parsed.limit);

    return {
      success: true,
      data: await Promise.all(rows.map((row) => this.mapIssue(row))),
    };
  }

  async createUpvote(payload: unknown) {
    const parsed = this.parseOrBadRequest(upvoteBodySchema, payload);

    const [issue] = await db.select({ id: issues.id }).from(issues).where(eq(issues.id, parsed.issueId)).limit(1);
    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const [created] = await db
      .insert(upvotes)
      .values({ issueId: parsed.issueId, deviceId: parsed.deviceId })
      .onConflictDoNothing({ target: [upvotes.issueId, upvotes.deviceId] })
      .returning();

    if (!created) {
      const [existing] = await db
        .select()
        .from(upvotes)
        .where(and(eq(upvotes.issueId, parsed.issueId), eq(upvotes.deviceId, parsed.deviceId)))
        .limit(1);

      if (!existing) {
        throw new BadRequestException('Unable to create or locate upvote');
      }

      return {
        success: true,
        data: this.mapUpvote(existing),
      };
    }

    return {
      success: true,
      data: this.mapUpvote(created),
    };
  }

  async removeUpvote(id: string) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new BadRequestException('Invalid upvote id');
    }

    await db.delete(upvotes).where(eq(upvotes.id, numericId));
    return { success: true, data: { deleted: true } };
  }

  async getUpvotesByIssue(issueId: string) {
    const numericIssueId = Number(issueId);
    if (Number.isNaN(numericIssueId)) {
      throw new BadRequestException('Invalid issue id');
    }

    const rows = await db.select().from(upvotes).where(eq(upvotes.issueId, numericIssueId));
    return {
      success: true,
      data: rows.map((row) => this.mapUpvote(row)),
    };
  }

  private async mapIssue(row: DbIssue): Promise<ApiIssue> {
    const upvoteCountResult = await db.select({ total: count() }).from(upvotes).where(eq(upvotes.issueId, row.id));
    const upvoteCount = Number(upvoteCountResult[0]?.total ?? 0);

    return {
      id: String(row.id),
      title: row.title,
      description: row.description,
      category: row.category as IssueCategory,
      status: row.status as IssueStatus,
      imageUrl: row.imageUrl,
      latitude: row.latitude / 1_000_000,
      longitude: row.longitude / 1_000_000,
      address: row.address,
      reportedAt: row.createdAt.toISOString(),
      acknowledgedAt: row.acknowledgedAt ? row.acknowledgedAt.toISOString() : null,
      inProgressAt: row.inProgressAt ? row.inProgressAt.toISOString() : null,
      resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
      rejectedAt: row.rejectedAt ? row.rejectedAt.toISOString() : null,
      rejectReason: row.rejectReason,
      upvoteCount,
      cityId: row.municipalityId ? String(row.municipalityId) : null,
    };
  }

  private mapUpvote(row: DbUpvote): ApiUpvote {
    return {
      id: String(row.id),
      issueId: String(row.issueId),
      deviceId: row.deviceId,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private parseOrBadRequest<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: parsed.error.flatten(),
      });
    }

    return parsed.data;
  }
}
