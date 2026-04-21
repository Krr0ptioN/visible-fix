import Link from 'next/link';
import { type AdminIssueFilters, type IssueCategory, type IssueStatus } from '@visiblefix/shared/types';
import { AdminIssuesTable } from '@/components/admin/admin-issues-table';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SectionEyebrow, Select, cn } from '@/components/ui';
import { getAdminIssues, getAdminOverview } from '@/lib/admin-api';
import { getServerI18n } from '@/lib/i18n/server';

type SearchValue = string | string[] | undefined;

type AdminDashboardPageProps = {
  searchParams: Promise<Record<string, SearchValue>>;
};

function getSingleValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function buildAdminQuery(filters: AdminIssueFilters) {
  const params = new URLSearchParams();

  if (filters.q?.trim()) {
    params.set('q', filters.q.trim());
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }

  if (filters.limit && filters.limit !== 20) {
    params.set('limit', String(filters.limit));
  }

  const query = params.toString();
  return query ? `/admin?${query}` : '/admin';
}

const STATUS_OPTIONS: Array<IssueStatus> = ['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected'];
const CATEGORY_OPTIONS: Array<IssueCategory> = ['pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other'];

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const { t, statusLabel, categoryLabel } = await getServerI18n();
  const rawParams = await searchParams;
  const filters: AdminIssueFilters = {
    q: getSingleValue(rawParams.q),
    status: getSingleValue(rawParams.status) as IssueStatus | undefined,
    category: getSingleValue(rawParams.category) as IssueCategory | undefined,
    page: Number(getSingleValue(rawParams.page) || '1'),
    limit: Number(getSingleValue(rawParams.limit) || '20'),
  };

  const [overview, issuesResponse] = await Promise.all([
    getAdminOverview(),
    getAdminIssues(filters),
  ]);

  const previousHref = buildAdminQuery({
    ...filters,
    page: Math.max(1, (filters.page ?? 1) - 1),
  });

  const nextHref = buildAdminQuery({
    ...filters,
    page: (issuesResponse.meta?.page ?? 1) + 1,
  });

  return (
    <section className="grid gap-6">
      <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(246,240,229,0.96))]">
        <CardHeader className="grid gap-6 border-b border-border/80 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <SectionEyebrow>{t('Operations center')}</SectionEyebrow>
            <CardTitle className="mt-3 text-4xl">{t('Issue triage, status control, and authenticated oversight.')}</CardTitle>
            <CardDescription className="max-w-3xl">
              {t(
                'This dashboard is now backed by cookie-based authentication and server-side authorization. Route protection, service checks, and repository scoping all use the authenticated admin context.'
              )}
            </CardDescription>
          </div>

          <div className="grid gap-3 border border-border bg-card/85 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t('Operator scope')}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subtle">{overview.user.role.replace('_', ' ')}</Badge>
              <Badge variant="subtle">
                {overview.user.municipalityId ? t('Municipality {id}', { id: overview.user.municipalityId }) : t('Global scope')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('Signed in as')} <span className="font-semibold text-foreground">{overview.user.email}</span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t('Total issues'), value: overview.stats.totalIssues, tone: 'bg-[#111114] text-white' },
            { label: t('Open issues'), value: overview.stats.openIssues, tone: 'bg-[#facc15] text-[#111114]' },
            { label: t('Resolved'), value: overview.stats.resolvedIssues, tone: 'bg-[#15803d] text-white' },
            { label: t('Rejected'), value: overview.stats.rejectedIssues, tone: 'bg-[#b91c1c] text-white' },
          ].map((stat) => (
            <div key={stat.label} className={cn('grid gap-2 border border-border p-4', stat.tone)}>
              <p className="text-[11px] uppercase tracking-[0.18em] opacity-75">{stat.label}</p>
              <p className="vf-display text-4xl font-bold">{stat.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionEyebrow>{t('Filter queue')}</SectionEyebrow>
          <CardTitle className="mt-3 text-3xl">{t('Operational search')}</CardTitle>
          <CardDescription>{t('Filter the queue by issue type, status, and free-text title search.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/admin" className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_220px_auto] lg:items-end">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              {t('Search')}
              <Input name="q" defaultValue={filters.q ?? ''} placeholder={t('Search issue titles')} />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              {t('Status')}
              <Select name="status" defaultValue={filters.status ?? ''}>
                <option value="">{t('All statuses')}</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              {t('Category')}
              <Select name="category" defaultValue={filters.category ?? ''}>
                <option value="">{t('All categories')}</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </Select>
            </label>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 lg:flex-none">
                {t('Apply')}
              </Button>
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                {t('Reset')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionEyebrow>{t('Issue queue')}</SectionEyebrow>
            <CardTitle className="mt-3 text-3xl">{t('Authenticated issue workflow')}</CardTitle>
            <CardDescription>
              {t('{count} issues found. Status updates hit the protected admin endpoint and then refresh the dashboard.', {
                count: issuesResponse.meta?.total ?? issuesResponse.data.length,
              })}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <AdminIssuesTable issues={issuesResponse.data} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('Page {page} of {total}', {
            page: issuesResponse.meta?.page ?? 1,
            total: Math.max(1, Math.ceil((issuesResponse.meta?.total ?? 0) / (issuesResponse.meta?.limit ?? 20))),
          })}
        </p>

        <div className="flex gap-3">
          <Link
            href={previousHref}
            className={cn(
              'inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm font-semibold transition',
              (issuesResponse.meta?.page ?? 1) <= 1
                ? 'pointer-events-none border-border bg-secondary text-muted-foreground opacity-50'
                : 'border-border bg-card text-foreground hover:bg-secondary'
            )}
          >
            {t('Previous')}
          </Link>
          <Link
            href={nextHref}
            className={cn(
              'inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm font-semibold transition',
              issuesResponse.meta?.hasMore
                ? 'border-border bg-card text-foreground hover:bg-secondary'
                : 'pointer-events-none border-border bg-secondary text-muted-foreground opacity-50'
            )}
          >
            {t('Next')}
          </Link>
        </div>
      </div>
    </section>
  );
}
