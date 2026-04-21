import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike } from 'drizzle-orm';
import type { Database } from '@visiblefix/database';
import { issues } from '@visiblefix/database/schema';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { DATABASE } from '../../common/database/database.module';
import { AppAbilityFactory } from '../access/app-ability.factory';
import { Action, type AppAbility } from '../access/access.types';

type IssueListFilters = {
  status?: string;
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
};

@Injectable()
export class IssuesRepository {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly abilityFactory: AppAbilityFactory
  ) {}

  async findMany(filters: IssueListFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;
    const conditions = this.buildPublicConditions(filters);

    const query = this.database.select().from(issues);
    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(issues.createdAt)).limit(limit).offset(offset)
        : await query.orderBy(desc(issues.createdAt)).limit(limit).offset(offset);

    return rows;
  }

  async countMany(filters: IssueListFilters) {
    const conditions = this.buildPublicConditions(filters);
    const query = this.database.select({ total: count() }).from(issues);
    const [result] = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
    return Number(result?.total ?? 0);
  }

  async findById(id: number) {
    const [issue] = await this.database.select().from(issues).where(eq(issues.id, id)).limit(1);
    return issue ?? null;
  }

  async create(input: {
    title: string;
    description?: string;
    category: string;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    address?: string;
    municipalityId: number;
    deviceId: string;
    userId?: number | null;
  }) {
    const [created] = await this.database
      .insert(issues)
      .values({
        title: input.title,
        description: input.description,
        category: input.category as typeof issues.$inferInsert.category,
        status: 'reported',
        imageUrl: input.imageUrl,
        latitude: Math.round(input.latitude * 1_000_000),
        longitude: Math.round(input.longitude * 1_000_000),
        address: input.address,
        municipalityId: input.municipalityId,
        deviceId: input.deviceId,
        userId: input.userId ?? null,
      })
      .returning();

    return created;
  }

  async updateStatus(
    id: number,
    input: {
      status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';
      note?: string;
    }
  ) {
    const now = new Date();
    const [updated] = await this.database
      .update(issues)
      .set({
        status: input.status,
        acknowledgedAt: input.status === 'acknowledged' ? now : undefined,
        inProgressAt: input.status === 'in_progress' ? now : undefined,
        resolvedAt: input.status === 'resolved' ? now : undefined,
        rejectedAt: input.status === 'rejected' ? now : undefined,
        rejectReason: input.status === 'rejected' ? input.note ?? null : undefined,
        updatedAt: now,
      })
      .where(eq(issues.id, id))
      .returning();

    return updated ?? null;
  }

  async search(query: string, limit: number) {
    const q = `%${query.trim()}%`;
    return this.database
      .select()
      .from(issues)
      .where(and(ilike(issues.title, q)))
      .orderBy(desc(issues.createdAt))
      .limit(limit);
  }

  async findManyForAdmin(filters: IssueListFilters, user: RequestUser, ability: AppAbility) {
    const scope = this.abilityFactory.getIssueScope(user, ability, Action.Read);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;
    const conditions = this.buildAdminConditions(filters, scope.municipalityId);

    const query = this.database.select().from(issues);
    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(issues.createdAt)).limit(limit).offset(offset)
        : await query.orderBy(desc(issues.createdAt)).limit(limit).offset(offset);

    return rows;
  }

  async countManyForAdmin(filters: IssueListFilters, user: RequestUser, ability: AppAbility) {
    const scope = this.abilityFactory.getIssueScope(user, ability, Action.Read);
    const conditions = this.buildAdminConditions(filters, scope.municipalityId);
    const query = this.database.select({ total: count() }).from(issues);
    const [result] = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
    return Number(result?.total ?? 0);
  }

  async findByIdForAdmin(id: number, user: RequestUser, ability: AppAbility, action: Action.Read | Action.Update) {
    const scope = this.abilityFactory.getIssueScope(user, ability, action);
    const conditions = [eq(issues.id, id)];

    if (typeof scope.municipalityId === 'number') {
      conditions.push(eq(issues.municipalityId, scope.municipalityId));
    }

    const [issue] = await this.database.select().from(issues).where(and(...conditions)).limit(1);
    return issue ?? null;
  }

  async getDashboardStats(user: RequestUser, ability: AppAbility) {
    const scope = this.abilityFactory.getIssueScope(user, ability, Action.Read);

    const byStatus = async (status?: string) => {
      const conditions = [];
      if (typeof scope.municipalityId === 'number') {
        conditions.push(eq(issues.municipalityId, scope.municipalityId));
      }
      if (status) {
        conditions.push(eq(issues.status, status as typeof issues.$inferSelect.status));
      }

      const query = this.database.select({ total: count() }).from(issues);
      const [result] = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
      return Number(result?.total ?? 0);
    };

    const [totalIssues, reportedIssues, acknowledgedIssues, inProgressIssues, resolvedIssues, rejectedIssues] = await Promise.all([
      byStatus(),
      byStatus('reported'),
      byStatus('acknowledged'),
      byStatus('in_progress'),
      byStatus('resolved'),
      byStatus('rejected'),
    ]);

    return {
      totalIssues,
      reportedIssues,
      acknowledgedIssues,
      inProgressIssues,
      resolvedIssues,
      rejectedIssues,
      openIssues: reportedIssues + acknowledgedIssues + inProgressIssues,
    };
  }

  private buildPublicConditions(filters: IssueListFilters) {
    const conditions = [];
    if (filters.status) {
      conditions.push(eq(issues.status, filters.status as typeof issues.$inferSelect.status));
    }
    if (filters.category) {
      conditions.push(eq(issues.category, filters.category as typeof issues.$inferSelect.category));
    }
    return conditions;
  }

  private buildAdminConditions(filters: IssueListFilters, municipalityId?: number) {
    const conditions = this.buildPublicConditions(filters);

    if (typeof municipalityId === 'number') {
      conditions.push(eq(issues.municipalityId, municipalityId));
    }

    if (filters.q?.trim()) {
      const q = `%${filters.q.trim()}%`;
      conditions.push(ilike(issues.title, q));
    }

    return conditions;
  }
}
