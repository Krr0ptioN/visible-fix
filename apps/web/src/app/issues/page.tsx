'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import {
  type Issue,
  type IssueCategory,
  type IssueStatus,
} from '@visiblefix/shared/types';
import { useI18n } from '@/components/i18n-provider';
import { GoogleMapComponent as GoogleMap } from '@/components/google-map';
import { SiteShell } from '@/components/site-shell';
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, SectionEyebrow, cn } from '@/components/ui';

const API_BASE_URL = '/api/v1';

const CATEGORIES: Array<IssueCategory | 'all'> = [
  'all',
  'pothole',
  'streetlight',
  'waste',
  'sidewalk',
  'water_leak',
  'accessibility',
  'other',
];

const STATUSES: Array<IssueStatus | 'all'> = ['all', 'reported', 'acknowledged', 'in_progress', 'resolved'];
type MobileSheetSnap = 'peek' | 'half' | 'full';

const MOBILE_SHEET_SNAP_ORDER: MobileSheetSnap[] = ['peek', 'half', 'full'];
const MOBILE_SHEET_TRANSLATE_Y: Record<MobileSheetSnap, number> = {
  peek: 68,
  half: 36,
  full: 4,
};
const MOBILE_SHEET_CONTENT_HEIGHT: Record<MobileSheetSnap, string> = {
  peek: 'max-h-[24svh]',
  half: 'max-h-[46svh]',
  full: 'max-h-[78svh]',
};

type FilterControlsProps = {
  selectedCategory: IssueCategory | 'all';
  selectedStatus: IssueStatus | 'all';
  onCategoryChange: (category: IssueCategory | 'all') => void;
  onStatusChange: (status: IssueStatus | 'all') => void;
  mode?: 'desktop' | 'mobile';
  className?: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  categoryLabel: (category: IssueCategory) => string;
  statusLabel: (status: IssueStatus) => string;
};

function FilterControls({
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
  mode = 'desktop',
  className,
  t,
  categoryLabel,
  statusLabel,
}: FilterControlsProps) {
  if (mode === 'mobile') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('Category')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={cn(
                  'inline-flex min-h-10 shrink-0 items-center whitespace-nowrap border px-3 text-xs font-semibold uppercase tracking-[0.12em] transition',
                  selectedCategory === category
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                {category === 'all' ? t('All categories') : categoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('Status')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={cn(
                  'inline-flex min-h-10 shrink-0 items-center whitespace-nowrap border px-3 text-xs font-semibold uppercase tracking-[0.12em] transition',
                  selectedStatus === status
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                {status === 'all' ? t('All statuses') : statusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/report"
          className="inline-flex min-h-11 w-full items-center justify-center border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#1a1a1d]"
        >
          {t('New report')}
        </Link>
      </div>
    );
  }

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <SectionEyebrow>{t('Discovery controls')}</SectionEyebrow>
        <CardTitle className="mt-3 text-3xl">{t('Public issue grid')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('Category')}</p>
          <div className="grid gap-px border border-border bg-border">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={cn(
                  'min-h-10 bg-card px-3 text-left text-sm font-medium transition',
                  selectedCategory === category ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                {category === 'all' ? t('All categories') : categoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('Status')}</p>
          <div className="grid gap-px border border-border bg-border">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={cn(
                  'min-h-10 bg-card px-3 text-left text-sm font-medium transition',
                  selectedStatus === status ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                {status === 'all' ? t('All statuses') : statusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/report"
          className="inline-flex min-h-11 w-full items-center justify-center border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#1a1a1d]"
        >
          {t('New report')}
        </Link>
      </CardContent>
    </Card>
  );
}

type IssuePanelsProps = {
  loading: boolean;
  error: string;
  issues: Issue[];
  selectedIssue: Issue | null;
  onSelectIssue: (id: string) => void;
  mode?: 'desktop' | 'mobile';
  className?: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  categoryLabel: (category: IssueCategory) => string;
  statusLabel: (status: IssueStatus) => string;
  formatDateTime: (value: string | number | Date) => string;
};

function IssuePanels({
  loading,
  error,
  issues,
  selectedIssue,
  onSelectIssue,
  mode = 'desktop',
  className,
  t,
  categoryLabel,
  statusLabel,
  formatDateTime,
}: IssuePanelsProps) {
  if (loading) {
    return (
      <Card className={className}>
          <CardContent className="p-6 text-sm text-muted-foreground">{t('Loading issue telemetry…')}</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-sm text-[#b42318]">{error}</CardContent>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <EmptyState
        title={t('No issues match the current filters.')}
        body={t('Adjust category or status filters to widen the search, or submit the first report in this area.')}
        action={
          <Link
            href="/report"
            className="inline-flex min-h-11 items-center justify-center border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#1a1a1d]"
          >
            {t('Submit a report')}
          </Link>
        }
      />
    );
  }

  if (mode === 'mobile') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('Issue list')}</p>
            <Badge variant="subtle">{t('{count} visible', { count: issues.length })}</Badge>
          </div>
          <div className="max-h-[28svh] divide-y divide-border overflow-y-auto">
            {issues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => onSelectIssue(issue.id)}
                className={cn(
                  'w-full space-y-1 px-3 py-3 text-left transition',
                  selectedIssue?.id === issue.id ? 'bg-secondary' : 'hover:bg-secondary'
                )}
              >
                <p className="line-clamp-2 text-sm font-semibold text-foreground">{issue.title}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="status" style={{ backgroundColor: `var(--status-${issue.status}, #111)` }}>
                    {statusLabel(issue.status)}
                  </Badge>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{categoryLabel(issue.category)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="border-b border-border px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('Focused record')}</p>
          </div>
          <div className="space-y-3 px-3 py-3">
            {selectedIssue ? (
              <>
                <p className="text-sm font-semibold text-foreground">{selectedIssue.title}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="status" style={{ backgroundColor: `var(--status-${selectedIssue.status}, #111)` }}>
                    {statusLabel(selectedIssue.status)}
                  </Badge>
                  <Badge variant="subtle">{categoryLabel(selectedIssue.category)}</Badge>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {selectedIssue.description || t('No additional description provided for this issue.')}
                </p>
                <Link
                  href={`/issues/${selectedIssue.id}`}
                  className="inline-flex min-h-10 w-full items-center justify-center border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  {t('Open full issue')}
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('Select an issue from the list or map to view details.')}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('grid content-start gap-6', className)}>
      <Card>
        <CardHeader>
          <SectionEyebrow>{t('Issue list')}</SectionEyebrow>
          <CardTitle className="mt-3 text-2xl">{t('Filtered reports')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-px border-t border-border bg-border p-0">
          {issues.map((issue) => (
            <button
              key={issue.id}
              type="button"
              onClick={() => onSelectIssue(issue.id)}
              className={cn(
                'grid gap-3 bg-card px-5 py-4 text-left transition md:grid-cols-[1fr_auto]',
                selectedIssue?.id === issue.id ? 'bg-secondary' : 'hover:bg-secondary'
              )}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{issue.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">{categoryLabel(issue.category)}</p>
              </div>
              <div className="flex items-start gap-2 md:justify-end">
                <Badge variant="status" style={{ backgroundColor: `var(--status-${issue.status}, #111)` }}>
                  {statusLabel(issue.status)}
                </Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionEyebrow>{t('Focused record')}</SectionEyebrow>
          <CardTitle className="mt-3 text-2xl">{selectedIssue?.title ?? t('Hover map pins or select a row')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {selectedIssue ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant="status" style={{ backgroundColor: `var(--status-${selectedIssue.status}, #111)` }}>
                  {statusLabel(selectedIssue.status)}
                </Badge>
                <Badge variant="subtle">{categoryLabel(selectedIssue.category)}</Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {selectedIssue.description || t('No additional description provided for this issue.')}
              </p>
              <div className="grid gap-px border border-border bg-border">
                {[
                  [t('Coordinates'), `${selectedIssue.latitude}, ${selectedIssue.longitude}`],
                  [t('Upvotes'), `${selectedIssue.upvoteCount}`],
                  [t('Reported'), formatDateTime(selectedIssue.reportedAt)],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[110px_1fr] gap-3 bg-card px-4 py-3 text-sm">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <Link
                href={`/issues/${selectedIssue.id}`}
                className="inline-flex min-h-11 items-center justify-center border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                {t('Open full issue')}
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('No record selected yet. Hover markers to preview details and click a pin or list row to focus one issue.')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function IssuesPage() {
  const { t, categoryLabel, statusLabel, formatDateTime } = useI18n();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [mobileSheetSnap, setMobileSheetSnap] = useState<MobileSheetSnap>('peek');
  const [mobileSheetDragOffset, setMobileSheetDragOffset] = useState(0);
  const [isMobileSheetDragging, setIsMobileSheetDragging] = useState(false);
  const [mapViewportHeight, setMapViewportHeight] = useState('calc(100dvh - 92px)');
  const mobileSheetStartYRef = useRef<number | null>(null);
  const mobileSheetDraggedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);

        const response = await fetch(`${API_BASE_URL}/issues?${params.toString()}`);
        if (!response.ok) throw new Error(t('Unable to load issues.'));

        const body = (await response.json()) as { data: Issue[] };
        const nextIssues = body.data ?? [];
        setIssues(nextIssues);
        setSelectedIssueId((current) => {
          if (!current) return null;
          return nextIssues.some((issue) => issue.id === current) ? current : null;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Unexpected error while loading issues.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const html = document.documentElement;
    const body = document.body;

    const updateViewportMetrics = () => {
      const header = document.getElementById('site-shell-header');
      const headerHeight = Math.ceil(header?.getBoundingClientRect().height ?? 92);
      setMapViewportHeight(`calc(100dvh - ${headerHeight}px)`);
    };

    const applyScrollLock = () => {
      if (mediaQuery.matches) {
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
      } else {
        html.style.overflow = '';
        body.style.overflow = '';
      }
      updateViewportMetrics();
    };

    applyScrollLock();
    window.addEventListener('resize', applyScrollLock);
    mediaQuery.addEventListener('change', applyScrollLock);

    return () => {
      window.removeEventListener('resize', applyScrollLock);
      mediaQuery.removeEventListener('change', applyScrollLock);
      html.style.overflow = '';
      body.style.overflow = '';
    };
  }, []);

  const selectedIssue = useMemo(() => issues.find((issue) => issue.id === selectedIssueId) ?? null, [issues, selectedIssueId]);

  const mapPoints = useMemo(
    () =>
      issues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        latitude: issue.latitude,
        longitude: issue.longitude,
        status: issue.status,
        category: issue.category,
      })),
    [issues]
  );

  const handleSelectIssue = (id: string) => {
    setSelectedIssueId(id);
    setMobileSheetSnap('half');
  };

  const shiftMobileSheetSnap = (direction: 'up' | 'down') => {
    setMobileSheetSnap((current) => {
      const currentIndex = MOBILE_SHEET_SNAP_ORDER.indexOf(current);
      const nextIndex =
        direction === 'up' ? Math.min(currentIndex + 1, MOBILE_SHEET_SNAP_ORDER.length - 1) : Math.max(currentIndex - 1, 0);
      return MOBILE_SHEET_SNAP_ORDER[nextIndex];
    });
  };

  const cycleMobileSheetSnap = () => {
    setMobileSheetSnap((current) => {
      const currentIndex = MOBILE_SHEET_SNAP_ORDER.indexOf(current);
      return MOBILE_SHEET_SNAP_ORDER[(currentIndex + 1) % MOBILE_SHEET_SNAP_ORDER.length];
    });
  };

  const commitMobileSheetDrag = (deltaY: number) => {
    if (Math.abs(deltaY) < 32) return;
    shiftMobileSheetSnap(deltaY < 0 ? 'up' : 'down');
  };

  const handleMobileSheetPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    mobileSheetStartYRef.current = event.clientY;
    mobileSheetDraggedRef.current = false;
    setIsMobileSheetDragging(true);
  };

  const handleMobileSheetPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mobileSheetStartYRef.current === null) return;
    const offset = Math.max(Math.min(event.clientY - mobileSheetStartYRef.current, 180), -180);
    if (Math.abs(offset) > 8) {
      mobileSheetDraggedRef.current = true;
    }
    setMobileSheetDragOffset(offset);
  };

  const handleMobileSheetPointerUp = () => {
    if (mobileSheetStartYRef.current !== null) {
      commitMobileSheetDrag(mobileSheetDragOffset);
    }
    mobileSheetStartYRef.current = null;
    setMobileSheetDragOffset(0);
    setIsMobileSheetDragging(false);
  };

  const handleMobileSheetToggleClick = () => {
    if (mobileSheetDraggedRef.current) {
      mobileSheetDraggedRef.current = false;
      return;
    }
    cycleMobileSheetSnap();
  };

  const handleMobileSheetToggleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    cycleMobileSheetSnap();
  };

  const mobileSheetTransform = `translateY(calc(${MOBILE_SHEET_TRANSLATE_Y[mobileSheetSnap]}% + ${mobileSheetDragOffset}px))`;

  return (
    <SiteShell activePage="issues" mainClassName="max-w-none overflow-hidden px-0 py-0" footerClassName="hidden xl:block">
      <section className="relative hidden md:block">
        <div className="relative w-full overflow-hidden" style={{ height: mapViewportHeight }}>
          <GoogleMap
            points={mapPoints}
            selectedPointId={selectedIssue?.id ?? null}
            onSelectPoint={handleSelectIssue}
            className="h-full border-0 shadow-none"
            heightClassName="h-full"
          />

          <div className="pointer-events-none absolute inset-0 z-30">
            <div className="pointer-events-auto absolute left-4 top-4 bottom-4 w-[min(440px,44vw)] max-w-[460px] overflow-hidden lg:left-6 lg:top-6 lg:bottom-6">
              <div className="h-full space-y-4 overflow-y-auto pr-1">
                <FilterControls
                  selectedCategory={selectedCategory}
                  selectedStatus={selectedStatus}
                  onCategoryChange={setSelectedCategory}
                  onStatusChange={setSelectedStatus}
                  mode="desktop"
                  t={t}
                  categoryLabel={categoryLabel}
                  statusLabel={statusLabel}
                />
                <IssuePanels
                  loading={loading}
                  error={error}
                  issues={issues}
                  selectedIssue={selectedIssue}
                  onSelectIssue={handleSelectIssue}
                  mode="desktop"
                  t={t}
                  categoryLabel={categoryLabel}
                  statusLabel={statusLabel}
                  formatDateTime={formatDateTime}
                />
              </div>
            </div>

            <div className="pointer-events-auto absolute right-4 top-4 lg:right-6 lg:top-6">
              <Badge variant="subtle">{t('{count} visible issues', { count: issues.length })}</Badge>
              
            </div>
          </div>
        </div>
      </section>

      <section className="relative md:hidden">
        <div className="relative w-full overflow-hidden" style={{ height: mapViewportHeight }}>
          <GoogleMap
            points={mapPoints}
            selectedPointId={selectedIssue?.id ?? null}
            onSelectPoint={handleSelectIssue}
            className="h-full border-0 shadow-none"
            heightClassName="h-full"
          />

          <div
            className={cn(
              'absolute inset-x-0 bottom-0 z-30 rounded-t-[22px] border border-border bg-[rgba(244,244,242,0.96)] shadow-[0_-14px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl',
              isMobileSheetDragging ? '' : 'transition-transform duration-300 ease-out'
            )}
            style={{ transform: mobileSheetTransform }}
          >
            <div
              role="button"
              tabIndex={0}
              onPointerDown={handleMobileSheetPointerDown}
              onPointerMove={handleMobileSheetPointerMove}
              onPointerUp={handleMobileSheetPointerUp}
              onPointerCancel={handleMobileSheetPointerUp}
              onClick={handleMobileSheetToggleClick}
              onKeyDown={handleMobileSheetToggleKeyDown}
              className="w-full touch-none select-none px-4 pt-3 text-left"
              aria-label={t('Toggle discovery controls sheet')}
            >
              <span className="mx-auto mb-2 block h-1.5 w-11 rounded-full bg-border" />
              <div className="flex items-center justify-between pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t('Discovery controls')}
                </p>
                <Badge variant="subtle">{t('{count} visible issues', { count: issues.length })}</Badge>
              </div>
              <p className="pb-2 text-xs text-muted-foreground">{t('Swipe up/down or tap this handle to change sheet height.')}</p>
            </div>

            <div className={cn('space-y-4 overflow-y-auto px-4 pb-6', MOBILE_SHEET_CONTENT_HEIGHT[mobileSheetSnap])}>
              <FilterControls
                className="border-b border-border pb-4"
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                onCategoryChange={setSelectedCategory}
                onStatusChange={setSelectedStatus}
                mode="mobile"
                t={t}
                categoryLabel={categoryLabel}
                statusLabel={statusLabel}
              />
              <IssuePanels
                className="gap-4"
                loading={loading}
                error={error}
                issues={issues}
                selectedIssue={selectedIssue}
                onSelectIssue={handleSelectIssue}
                mode="mobile"
                t={t}
                categoryLabel={categoryLabel}
                statusLabel={statusLabel}
                formatDateTime={formatDateTime}
              />
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
