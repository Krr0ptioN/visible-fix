'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  STATUS_COLORS,
  type Issue,
  type Upvote,
} from '@visiblefix/shared/types';
import { useI18n } from '@/components/i18n-provider';
import { SiteShell } from '@/components/site-shell';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, SectionEyebrow } from '@/components/ui';

const API_BASE_URL = '/api/v1';

type IssueDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { t, categoryLabel, statusLabel, formatDateTime } = useI18n();
  const [issueId, setIssueId] = useState<string>('');
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deviceId, setDeviceId] = useState('web-anonymous');
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [upvoteError, setUpvoteError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existing = window.localStorage.getItem('visiblefix-device-id');
    if (existing) {
      setDeviceId(existing);
      return;
    }

    const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `vf-${Date.now()}`;
    window.localStorage.setItem('visiblefix-device-id', generated);
    setDeviceId(generated);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const resolved = await params;
      setIssueId(resolved.id);
    };
    void initialize();
  }, [params]);

  useEffect(() => {
    if (!issueId || !deviceId) return;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [issueResponse, upvotesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/issues/${issueId}`),
          fetch(`${API_BASE_URL}/issues/${issueId}/upvotes`),
        ]);

        if (!issueResponse.ok) throw new Error(t('Issue not found.'));
        if (!upvotesResponse.ok) throw new Error(t('Unable to load issue upvotes.'));

        const issueBody = (await issueResponse.json()) as { data: Issue };
        const upvotesBody = (await upvotesResponse.json()) as { data: Upvote[] };

        setIssue(issueBody.data);
        setHasUpvoted((upvotesBody.data ?? []).some((upvote) => upvote.deviceId === deviceId));
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Unexpected error while loading issue.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [issueId, deviceId]);

  const handleUpvote = async () => {
    if (!issue || hasUpvoted || upvoting) return;

    setUpvoting(true);
    setUpvoteError('');

    try {
      const response = await fetch(`${API_BASE_URL}/upvotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, deviceId }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || t('Unable to register upvote.'));
      }

      setHasUpvoted(true);
      setIssue((prev) => (prev ? { ...prev, upvoteCount: prev.upvoteCount + 1 } : prev));
    } catch (err) {
      setUpvoteError(err instanceof Error ? err.message : t('Unexpected upvote error.'));
    } finally {
      setUpvoting(false);
    }
  };

  const handleShare = async () => {
    if (!issue) return;

    const shareText = `${issue.title}\n${t('View on VisibleFix')}: ${window.location.href}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: issue.title,
          text: shareText,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      alert(t('Issue link copied to clipboard.'));
    } catch {
      setUpvoteError(t('Unable to share this issue right now.'));
    }
  };

  const timeline = useMemo(() => {
    if (!issue) return [];

    return [
      { key: 'reported', label: statusLabel('reported'), date: issue.reportedAt, color: STATUS_COLORS.reported },
      ...(issue.acknowledgedAt
        ? [{ key: 'acknowledged', label: statusLabel('acknowledged'), date: issue.acknowledgedAt, color: STATUS_COLORS.acknowledged }]
        : []),
      ...(issue.inProgressAt
        ? [{ key: 'in_progress', label: statusLabel('in_progress'), date: issue.inProgressAt, color: STATUS_COLORS.in_progress }]
        : []),
      ...(issue.resolvedAt
        ? [{ key: 'resolved', label: statusLabel('resolved'), date: issue.resolvedAt, color: STATUS_COLORS.resolved }]
        : []),
      ...(issue.rejectedAt
        ? [{ key: 'rejected', label: statusLabel('rejected'), date: issue.rejectedAt, color: STATUS_COLORS.rejected }]
        : []),
    ];
  }, [issue, statusLabel]);

  return (
    <SiteShell activePage="issues">
      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">{t('Loading issue record…')}</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-[#b42318]">{error}</CardContent>
        </Card>
      ) : issue ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <SectionEyebrow>{t('Public issue record')}</SectionEyebrow>
              <CardTitle className="mt-3 text-4xl">{issue.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="status" style={{ backgroundColor: STATUS_COLORS[issue.status] }}>
                  {statusLabel(issue.status)}
                </Badge>
                <Badge variant="subtle">{categoryLabel(issue.category)}</Badge>
              </div>

              <p className="text-sm leading-7 text-muted-foreground">
                {issue.description || t('No additional description was provided for this report.')}
              </p>

              <div className="grid gap-px border border-border bg-border">
                {[
                  [t('Latitude'), `${issue.latitude}`],
                  [t('Longitude'), `${issue.longitude}`],
                  [t('Reported'), formatDateTime(issue.reportedAt)],
                  [t('Upvotes'), `${issue.upvoteCount}`],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[110px_1fr] gap-4 bg-card px-4 py-3 text-sm">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleUpvote} disabled={hasUpvoted || upvoting}>
                  {upvoting ? t('Submitting…') : hasUpvoted ? `${t('Supported')} (${issue.upvoteCount})` : `${t('Support')} (${issue.upvoteCount})`}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  {t('Share issue')}
                </Button>
              </div>

              {upvoteError ? <div className="border border-[#fda29b] bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">{upvoteError}</div> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionEyebrow>{t('Status timeline')}</SectionEyebrow>
              <CardTitle className="mt-3 text-3xl">{t('Lifecycle')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-px border border-border bg-border p-0">
              {timeline.map((item) => (
                <div key={item.key} className="grid grid-cols-[16px_1fr] gap-4 bg-card px-5 py-4">
                  <span className="mt-1 h-4 w-4 border" style={{ backgroundColor: item.color, borderColor: item.color }} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{formatDateTime(item.date)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </SiteShell>
  );
}
