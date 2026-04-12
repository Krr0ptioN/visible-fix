'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ISSUE_STATUS_LABELS, STATUS_COLORS, type Issue, type IssueStatus } from '@visiblefix/shared/types';

const API_BASE_URL = '/api/v1';
const ADMIN_TOKEN_STORAGE_KEY = 'visiblefix-admin-token';

const STATUSES: IssueStatus[] = ['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected'];

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [savingIssueId, setSavingIssueId] = useState<string | null>(null);
  const [nextStatusByIssue, setNextStatusByIssue] = useState<Record<string, IssueStatus>>({});
  const [noteByIssue, setNoteByIssue] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedToken = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (savedToken) setAdminToken(savedToken);
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/issues?limit=100`);
      if (!response.ok) throw new Error('Unable to load issues.');

      const body = (await response.json()) as { data: Issue[] };
      const loadedIssues = body.data ?? [];
      setIssues(loadedIssues);

      const statusMap: Record<string, IssueStatus> = {};
      for (const issue of loadedIssues) {
        statusMap[issue.id] = issue.status;
      }
      setNextStatusByIssue(statusMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error while loading issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchIssues();
  }, []);

  const handleSaveToken = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, adminToken.trim());
    setActionMessage('Admin token saved in local browser storage.');
  };

  const handleUpdateStatus = async (issueId: string) => {
    const status = nextStatusByIssue[issueId];
    if (!status) return;

    const trimmedToken = adminToken.trim();
    if (!trimmedToken) {
      setError('Admin token is required for status updates.');
      return;
    }

    setSavingIssueId(issueId);
    setError('');
    setActionMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': trimmedToken,
        },
        body: JSON.stringify({ status, note: noteByIssue[issueId]?.trim() || undefined }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Failed to update issue status.');
      }

      setActionMessage(`Issue #${issueId} updated to ${ISSUE_STATUS_LABELS[status]}.`);
      await fetchIssues();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error while updating status.');
    } finally {
      setSavingIssueId(null);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">VisibleFix</p>
          <h1 className="text-3xl font-bold tracking-tight">Admin status management</h1>
        </div>
        <Link href="/issues" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Back to discovery
        </Link>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Authentication</h2>
        <p className="mt-1 text-sm text-slate-600">Use the same token configured in API `ADMIN_TOKEN` for protected status updates.</p>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            placeholder="Enter admin token"
            className="w-full rounded-md border border-slate-300 p-2"
          />
          <button
            type="button"
            onClick={handleSaveToken}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Save token
          </button>
        </div>
      </section>

      {error && <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {actionMessage && <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{actionMessage}</p>}

      {loading ? (
        <p className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading issues…</p>
      ) : (
        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Issue</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Current</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Next status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Note</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td className="px-3 py-3 align-top">
                    <p className="text-sm font-semibold text-slate-900">{issue.title}</p>
                    <p className="text-xs text-slate-600">#{issue.id} • {issue.category}</p>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: STATUS_COLORS[issue.status] }}
                    >
                      {ISSUE_STATUS_LABELS[issue.status]}
                    </span>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <select
                      value={nextStatusByIssue[issue.id] ?? issue.status}
                      onChange={(event) =>
                        setNextStatusByIssue((prev) => ({
                          ...prev,
                          [issue.id]: event.target.value as IssueStatus,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 p-2 text-sm"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ISSUE_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <input
                      type="text"
                      value={noteByIssue[issue.id] ?? ''}
                      onChange={(event) =>
                        setNoteByIssue((prev) => ({
                          ...prev,
                          [issue.id]: event.target.value,
                        }))
                      }
                      placeholder="Optional note"
                      className="w-full rounded-md border border-slate-300 p-2 text-sm"
                    />
                  </td>

                  <td className="px-3 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus(issue.id)}
                      disabled={savingIssueId === issue.id}
                      className="rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {savingIssueId === issue.id ? 'Saving…' : 'Update'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
