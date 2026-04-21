'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATUS_COLORS, type Issue, type IssueStatus } from '@visiblefix/shared/types';
import { useI18n } from '@/components/i18n-provider';
import { Badge, Button, Input, Select } from '@/components/ui';

const STATUSES: IssueStatus[] = ['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected'];

export function AdminIssuesTable({
  issues,
}: {
  issues: Issue[];
}) {
  const router = useRouter();
  const { t, statusLabel } = useI18n();
  const [rows, setRows] = useState(issues);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [savingIssueId, setSavingIssueId] = useState<string | null>(null);
  const [nextStatusByIssue, setNextStatusByIssue] = useState<Record<string, IssueStatus>>({});
  const [noteByIssue, setNoteByIssue] = useState<Record<string, string>>({});

  useEffect(() => {
    setRows(issues);
    setNextStatusByIssue(
      Object.fromEntries(
        issues.map((issue) => [issue.id, issue.status])
      ) as Record<string, IssueStatus>
    );
  }, [issues]);

  const handleUpdateStatus = async (issueId: string) => {
    const status = nextStatusByIssue[issueId];
    if (!status) {
      return;
    }

    setSavingIssueId(issueId);
    setError('');
    setActionMessage('');

    try {
      const response = await fetch(`/api/v1/admin/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          status,
          note: noteByIssue[issueId]?.trim() || undefined,
        }),
      });

      const body = (await response.json().catch(() => null)) as { data?: Issue; message?: string } | null;
      if (!response.ok || !body?.data) {
        throw new Error(body?.message || t('Failed to update issue status.'));
      }

      setRows((currentRows) => currentRows.map((row) => (row.id === issueId ? body.data! : row)));
      setActionMessage(t('Issue #{issueId} moved to {status}.', { issueId, status: statusLabel(status) }));

      startTransition(() => {
        router.refresh();
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t('Failed to update issue status.'));
    } finally {
      setSavingIssueId(null);
    }
  };

  if (rows.length === 0) {
    return <div className="p-6 text-sm text-muted-foreground">{t('No issues match the current filter set.')}</div>;
  }

  return (
    <div className="grid gap-4">
      {error ? <div className="border border-[#fda29b] bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">{error}</div> : null}
      {actionMessage ? (
        <div className="border border-[#75e0a7] bg-[#ecfdf3] px-4 py-3 text-sm text-[#067647]">{actionMessage}</div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-y border-border bg-secondary text-left text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">{t('Issue')}</th>
              <th className="px-4 py-3 font-semibold">{t('Location')}</th>
              <th className="px-4 py-3 font-semibold">{t('Current')}</th>
              <th className="px-4 py-3 font-semibold">{t('Next status')}</th>
              <th className="px-4 py-3 font-semibold">{t('Note')}</th>
              <th className="px-4 py-3 font-semibold">{t('Action')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((issue) => (
              <tr key={issue.id} className="border-b border-border align-top">
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-foreground">{issue.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    #{issue.id} / {issue.category}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  <p>{issue.address || t('No precise address')}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em]">
                    {issue.latitude.toFixed(5)}, {issue.longitude.toFixed(5)}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="status" style={{ backgroundColor: STATUS_COLORS[issue.status] }}>
                    {statusLabel(issue.status)}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <Select
                    value={nextStatusByIssue[issue.id] ?? issue.status}
                    onChange={(event) =>
                      setNextStatusByIssue((current) => ({
                        ...current,
                        [issue.id]: event.target.value as IssueStatus,
                      }))
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-4">
                  <Input
                    value={noteByIssue[issue.id] ?? ''}
                    onChange={(event) =>
                      setNoteByIssue((current) => ({
                        ...current,
                        [issue.id]: event.target.value,
                      }))
                    }
                    placeholder={t('Optional operator note')}
                  />
                </td>
                <td className="px-4 py-4">
                  <Button onClick={() => void handleUpdateStatus(issue.id)} disabled={savingIssueId === issue.id}>
                    {savingIssueId === issue.id ? t('Saving…') : t('Update')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
