'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ISSUE_CATEGORY_LABELS,
  ISSUE_STATUS_LABELS,
  STATUS_COLORS,
  type Issue,
  type Upvote,
} from '@visiblefix/shared/types';

const API_BASE_URL = '/api/v1';

type IssueDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function IssueDetailPage({ params }: IssueDetailPageProps) {
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

        if (!issueResponse.ok) throw new Error('Issue not found.');
        if (!upvotesResponse.ok) throw new Error('Unable to load issue upvotes.');

        const issueBody = (await issueResponse.json()) as { data: Issue };
        const upvotesBody = (await upvotesResponse.json()) as { data: Upvote[] };

        setIssue(issueBody.data);
        setHasUpvoted((upvotesBody.data ?? []).some((upvote) => upvote.deviceId === deviceId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error while loading issue.');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issueId, deviceId }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Unable to register upvote.');
      }

      setHasUpvoted(true);
      setIssue((prev) => (prev ? { ...prev, upvoteCount: prev.upvoteCount + 1 } : prev));
    } catch (err) {
      setUpvoteError(err instanceof Error ? err.message : 'Unexpected upvote error.');
    } finally {
      setUpvoting(false);
    }
  };

  const handleShare = async () => {
    if (!issue) return;

    const shareText = `${issue.title}\nView on VisibleFix: ${window.location.href}`;

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
      alert('Issue link copied to clipboard.');
    } catch {
      setUpvoteError('Unable to share this issue right now.');
    }
  };

  const timeline = issue
    ? [
        { key: 'reported', label: ISSUE_STATUS_LABELS.reported, date: issue.reportedAt, color: STATUS_COLORS.reported },
        ...(issue.acknowledgedAt
          ? [{ key: 'acknowledged', label: ISSUE_STATUS_LABELS.acknowledged, date: issue.acknowledgedAt, color: STATUS_COLORS.acknowledged }]
          : []),
        ...(issue.inProgressAt
          ? [{ key: 'in_progress', label: ISSUE_STATUS_LABELS.in_progress, date: issue.inProgressAt, color: STATUS_COLORS.in_progress }]
          : []),
        ...(issue.resolvedAt
          ? [{ key: 'resolved', label: ISSUE_STATUS_LABELS.resolved, date: issue.resolvedAt, color: STATUS_COLORS.resolved }]
          : []),
        ...(issue.rejectedAt
          ? [{ key: 'rejected', label: ISSUE_STATUS_LABELS.rejected, date: issue.rejectedAt, color: STATUS_COLORS.rejected }]
          : []),
      ]
    : [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-slate-900">
      <Link href="/issues" className="text-sm font-medium text-blue-700 hover:text-blue-800">
        ← Back to discovery
      </Link>

      {loading ? (
        <p className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading issue…</p>
      ) : error ? (
        <p className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>
      ) : issue ? (
        <article className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold tracking-tight">{issue.title}</h1>
          <p className="mt-3 text-sm text-slate-600">{issue.description || 'No additional description provided.'}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: STATUS_COLORS[issue.status] }}
            >
              {ISSUE_STATUS_LABELS[issue.status]}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {ISSUE_CATEGORY_LABELS[issue.category]}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Latitude</dt>
              <dd>{issue.latitude}</dd>
            </div>
            <div>
              <dt className="font-semibold">Longitude</dt>
              <dd>{issue.longitude}</dd>
            </div>
            <div>
              <dt className="font-semibold">Reported at</dt>
              <dd>{new Date(issue.reportedAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-semibold">Upvotes</dt>
              <dd>{issue.upvoteCount}</dd>
            </div>
          </dl>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Status timeline</h2>
            <ol className="mt-3 space-y-3">
              {timeline.map((item) => (
                <li key={item.key} className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
                  <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-600">{new Date(item.date).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUpvote}
              disabled={hasUpvoted || upvoting}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                hasUpvoted
                  ? 'cursor-not-allowed bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70'
              }`}
            >
              {upvoting ? 'Submitting…' : hasUpvoted ? `✓ Supported (${issue.upvoteCount})` : `👍 Support (${issue.upvoteCount})`}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Share
            </button>
          </section>

          {upvoteError && <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{upvoteError}</p>}
        </article>
      ) : null}
    </main>
  );
}
