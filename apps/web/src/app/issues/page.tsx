'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ISSUE_STATUS_LABELS,
  STATUS_COLORS,
  type Issue,
  type IssueCategory,
  type IssueStatus,
} from '@visiblefix/shared/types';

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

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);

        const response = await fetch(`${API_BASE_URL}/issues?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Unable to load issues.');
        }

        const body = (await response.json()) as { data: Issue[] };
        setIssues(body.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error while loading issues.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [selectedCategory, selectedStatus]);

  const mapBounds = useMemo(() => {
    if (issues.length === 0) return null;

    const lats = issues.map((issue) => issue.latitude);
    const lngs = issues.map((issue) => issue.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return { minLat, maxLat, minLng, maxLng };
  }, [issues]);

  const getMarkerStyle = (issue: Issue) => {
    if (!mapBounds) {
      return { left: '50%', top: '50%' };
    }

    const latRange = Math.max(mapBounds.maxLat - mapBounds.minLat, 0.000001);
    const lngRange = Math.max(mapBounds.maxLng - mapBounds.minLng, 0.000001);

    const left = ((issue.longitude - mapBounds.minLng) / lngRange) * 100;
    const top = 100 - ((issue.latitude - mapBounds.minLat) / latRange) * 100;

    return {
      left: `${Math.min(Math.max(left, 3), 97)}%`,
      top: `${Math.min(Math.max(top, 3), 97)}%`,
    };
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">VisibleFix</p>
          <h1 className="text-3xl font-bold tracking-tight">Map & discovery</h1>
        </div>
        <Link href="/report" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          + New report
        </Link>
      </div>

      <section className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-1 text-sm ${
                  selectedCategory === category ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">Status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-3 py-1 text-sm ${
                  selectedStatus === status ? 'text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor:
                    selectedStatus === status && status !== 'all' ? STATUS_COLORS[status] : selectedStatus === status ? '#1d4ed8' : undefined,
                }}
              >
                {status === 'all' ? 'all' : ISSUE_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <p className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading issues…</p>
      ) : error ? (
        <p className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">Map markers ({issues.length})</p>
            <div className="relative h-[460px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {issues.length === 0 && <p className="p-6 text-sm text-slate-500">No issues found with current filters.</p>}

              {issues.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-1 shadow"
                  style={{
                    ...getMarkerStyle(issue),
                    backgroundColor: STATUS_COLORS[issue.status],
                    borderColor: selectedIssueId === issue.id ? '#0f172a' : '#ffffff',
                  }}
                  title={`${issue.title} (${ISSUE_STATUS_LABELS[issue.status]})`}
                >
                  <span className="block h-2.5 w-2.5 rounded-full bg-white" />
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Lightweight web map view: marker positions are projected from issue latitude/longitude.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">Issue list</p>
            <div className="space-y-2">
              {issues.length === 0 && <p className="text-sm text-slate-500">No issues to show.</p>}

              {issues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className={`block rounded-md border p-3 transition ${
                    selectedIssueId === issue.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{issue.title}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {ISSUE_STATUS_LABELS[issue.status]} • {issue.category}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
