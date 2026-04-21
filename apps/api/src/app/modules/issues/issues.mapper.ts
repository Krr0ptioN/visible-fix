import type { IssueCategory, IssueStatus } from '@visiblefix/shared/types';
import type { issues } from '@visiblefix/database/schema';

type DbIssue = typeof issues.$inferSelect;

export class IssuesMapper {
  static toApiIssue(row: DbIssue, upvoteCount: number) {
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
      acknowledgedAt: row.acknowledgedAt?.toISOString() ?? null,
      inProgressAt: row.inProgressAt?.toISOString() ?? null,
      resolvedAt: row.resolvedAt?.toISOString() ?? null,
      rejectedAt: row.rejectedAt?.toISOString() ?? null,
      rejectReason: row.rejectReason,
      upvoteCount,
      cityId: row.municipalityId ? String(row.municipalityId) : null,
    };
  }
}
