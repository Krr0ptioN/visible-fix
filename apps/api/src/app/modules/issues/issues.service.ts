import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { IssuesMapper } from './issues.mapper';
import { IssuesRepository } from './issues.repository';
import { UpvotesRepository } from './upvotes.repository';

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

const searchIssuesQuerySchema = z.object({
  q: z.string().min(2).max(200),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const upvoteBodySchema = z.object({
  issueId: z.coerce.number().int().positive(),
  deviceId: z.string().min(1).max(100),
});

type IssueRecord = NonNullable<Awaited<ReturnType<IssuesRepository['findById']>>>;

@Injectable()
export class IssuesService {
  constructor(
    private readonly issuesRepository: IssuesRepository,
    private readonly upvotesRepository: UpvotesRepository
  ) {}

  async getIssues(rawQuery: unknown) {
    const parsed = this.parseOrBadRequest(listIssuesQuerySchema, rawQuery ?? {});
    const [rows, total] = await Promise.all([
      this.issuesRepository.findMany(parsed),
      this.issuesRepository.countMany(parsed),
    ]);

    const data = await Promise.all(rows.map((row) => this.mapIssue(row)));
    const offset = (parsed.page - 1) * parsed.limit;

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
    const issueId = this.parseNumericId(id, 'issue');
    const issue = await this.issuesRepository.findById(issueId);

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return {
      success: true,
      data: await this.mapIssue(issue),
    };
  }

  async createIssue(payload: unknown, municipalityId?: number) {
    const parsed = this.parseOrBadRequest(createIssueSchema, payload);
    const created = await this.issuesRepository.create({
      ...parsed,
      municipalityId: municipalityId ?? null,
    });

    return {
      success: true,
      data: await this.mapIssue(created),
    };
  }

  async searchIssues(query: string, limitRaw?: unknown) {
    const parsed = this.parseOrBadRequest(searchIssuesQuerySchema, {
      q: query,
      limit: limitRaw,
    });
    const rows = await this.issuesRepository.search(parsed.q, parsed.limit);

    return {
      success: true,
      data: await Promise.all(rows.map((row) => this.mapIssue(row))),
    };
  }

  async getUpvotesByIssue(issueId: string) {
    const parsedIssueId = this.parseNumericId(issueId, 'issue');
    const rows = await this.upvotesRepository.findByIssueId(parsedIssueId);

    return {
      success: true,
      data: rows.map((row) => ({
        id: String(row.id),
        issueId: String(row.issueId),
        deviceId: row.deviceId,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async createUpvote(payload: unknown) {
    const parsed = this.parseOrBadRequest(upvoteBodySchema, payload);
    const created = await this.upvotesRepository.create(parsed);

    if (!created) {
      throw new NotFoundException('Issue not found');
    }

    return {
      success: true,
      data: {
        id: String(created.id),
        issueId: String(created.issueId),
        deviceId: created.deviceId,
        createdAt: created.createdAt.toISOString(),
      },
    };
  }

  async removeUpvote(id: string) {
    const upvoteId = this.parseNumericId(id, 'upvote');
    await this.upvotesRepository.deleteById(upvoteId);

    return {
      success: true,
      data: { deleted: true },
    };
  }

  private async mapIssue(row: IssueRecord) {
    const upvoteCount = await this.upvotesRepository.countByIssueId(row.id);
    return IssuesMapper.toApiIssue(row, upvoteCount);
  }

  private parseNumericId(id: string, entityLabel: string) {
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      throw new BadRequestException(`Invalid ${entityLabel} id`);
    }
    return parsedId;
  }

  private parseOrBadRequest<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return result.data;
  }
}
