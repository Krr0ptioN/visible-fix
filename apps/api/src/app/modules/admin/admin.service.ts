import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { AppAbilityFactory } from '../access/app-ability.factory';
import { Action } from '../access/access.types';
import { IssuesMapper } from '../issues/issues.mapper';
import { IssuesRepository } from '../issues/issues.repository';
import { UpvotesRepository } from '../issues/upvotes.repository';
import { UsersService } from '../users/users.service';

const adminListIssuesQuerySchema = z.object({
  status: z.enum(['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected']).optional(),
  category: z.enum(['pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other']).optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const updateIssueStatusSchema = z.object({
  status: z.enum(['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected']),
  note: z.string().max(2000).optional(),
});

@Injectable()
export class AdminService {
  constructor(
    private readonly abilityFactory: AppAbilityFactory,
    private readonly issuesRepository: IssuesRepository,
    private readonly upvotesRepository: UpvotesRepository,
    private readonly usersService: UsersService
  ) {}

  async getOverview(user: RequestUser) {
    const ability = this.abilityFactory.createForUser(user);
    this.assertDashboardAccess(ability);

    return {
      success: true,
      data: {
        user: this.usersService.toAuthUser(user),
        stats: await this.issuesRepository.getDashboardStats(user, ability),
      },
    };
  }

  async getIssues(user: RequestUser, rawQuery: unknown) {
    const ability = this.abilityFactory.createForUser(user);
    this.assertDashboardAccess(ability);

    const parsed = this.parseOrBadRequest(adminListIssuesQuerySchema, rawQuery ?? {});
    const [rows, total] = await Promise.all([
      this.issuesRepository.findManyForAdmin(parsed, user, ability),
      this.issuesRepository.countManyForAdmin(parsed, user, ability),
    ]);

    const data = await Promise.all(
      rows.map(async (row) => {
        const upvoteCount = await this.upvotesRepository.countByIssueId(row.id);
        return IssuesMapper.toApiIssue(row, upvoteCount);
      })
    );
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

  async updateIssueStatus(user: RequestUser, id: string, payload: unknown) {
    const issueId = Number(id);
    if (Number.isNaN(issueId)) {
      throw new BadRequestException('Invalid issue id');
    }

    const ability = this.abilityFactory.createForUser(user);
    this.assertDashboardAccess(ability);

    const parsed = this.parseOrBadRequest(updateIssueStatusSchema, payload);
    const existingIssue = await this.issuesRepository.findByIdForAdmin(issueId, user, ability, Action.Update);

    if (!existingIssue) {
      throw new NotFoundException('Issue not found');
    }

    const updated = await this.issuesRepository.updateStatus(issueId, parsed);
    if (!updated) {
      throw new NotFoundException('Issue not found');
    }

    return {
      success: true,
      data: IssuesMapper.toApiIssue(updated, await this.upvotesRepository.countByIssueId(updated.id)),
    };
  }

  private assertDashboardAccess(ability: ReturnType<AppAbilityFactory['createForUser']>) {
    if (!ability.can(Action.Read, 'AdminDashboard') && !ability.can(Action.Manage, 'all')) {
      throw new ForbiddenException('Admin dashboard access is required');
    }
  }

  private parseOrBadRequest<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return result.data;
  }
}
