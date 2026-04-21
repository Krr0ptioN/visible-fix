import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AdminIssueFilters, Issue, IssueCategory, IssueStatus } from '../../../../libs/shared/types/src';
import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS, STATUS_COLORS } from '../../../../libs/shared/types/src';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const STATUSES: IssueStatus[] = ['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected'];
const CATEGORIES: IssueCategory[] = ['pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other'];

type AuthMode = 'sign-in' | 'sign-up';

type QueueFilters = {
  q: string;
  status: IssueStatus | 'all';
  category: IssueCategory | 'all';
  page: number;
  limit: number;
};

const DEFAULT_FILTERS: QueueFilters = {
  q: '',
  status: 'all',
  category: 'all',
  page: 1,
  limit: 20,
};

export default function OperationsScreen() {
  const { user, isLoading: authLoading, isAuthenticated, signIn, signUp, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  const [filters, setFilters] = useState<QueueFilters>(DEFAULT_FILTERS);
  const [overview, setOverview] = useState<{
    stats: {
      totalIssues: number;
      openIssues: number;
      resolvedIssues: number;
      rejectedIssues: number;
    };
  } | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const [nextStatusByIssue, setNextStatusByIssue] = useState<Record<string, IssueStatus>>({});
  const [noteByIssue, setNoteByIssue] = useState<Record<string, string>>({});
  const [savingIssueId, setSavingIssueId] = useState<string | null>(null);

  const canViewOperations = user?.role === 'admin' || user?.role === 'municipal_staff';

  const adminFilters = useMemo<AdminIssueFilters>(
    () => ({
      q: filters.q.trim() || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      category: filters.category === 'all' ? undefined : filters.category,
      page: filters.page,
      limit: filters.limit,
    }),
    [filters]
  );

  const loadOperationsData = useCallback(async () => {
    if (!canViewOperations) return;

    setQueueLoading(true);
    setQueueError('');
    try {
      const [adminOverview, queue] = await Promise.all([api.getAdminOverview(), api.getAdminIssues(adminFilters)]);
      setOverview(adminOverview);
      setIssues(queue.data);
      setHasMore(Boolean(queue.meta?.hasMore));
      setNextStatusByIssue(Object.fromEntries(queue.data.map((issue) => [issue.id, issue.status])) as Record<string, IssueStatus>);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load operations queue.';
      setQueueError(message);
    } finally {
      setQueueLoading(false);
    }
  }, [adminFilters, canViewOperations]);

  useEffect(() => {
    void loadOperationsData();
  }, [loadOperationsData]);

  const submitAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError('Email and password are required.');
      return;
    }

    if (authMode === 'sign-up') {
      if (!name.trim()) {
        setAuthError('Full name is required.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }
    }

    setAuthBusy(true);
    setAuthError('');

    try {
      if (authMode === 'sign-in') {
        await signIn(email.trim(), password);
      } else {
        await signUp({ name: name.trim(), email: email.trim(), password });
      }

      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const cycleStatus = (issueId: string) => {
    setNextStatusByIssue((current) => {
      const active = current[issueId];
      const index = STATUSES.indexOf(active);
      const next = STATUSES[(index + 1) % STATUSES.length];
      return { ...current, [issueId]: next };
    });
  };

  const updateIssueStatus = async (issueId: string) => {
    const nextStatus = nextStatusByIssue[issueId];
    if (!nextStatus) return;

    setSavingIssueId(issueId);
    setQueueError('');

    try {
      const updated = await api.updateAdminIssueStatus(issueId, nextStatus, noteByIssue[issueId]?.trim() || undefined);
      setIssues((current) => current.map((issue) => (issue.id === issueId ? updated : issue)));
      Alert.alert('Status updated', `Issue moved to ${ISSUE_STATUS_LABELS[nextStatus]}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update issue.';
      setQueueError(message);
    } finally {
      setSavingIssueId(null);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f1012" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Operations access</Text>
          <Text style={styles.title}>Sign in to open the operations console.</Text>

          <View style={styles.authToggle}>
            <TouchableOpacity style={[styles.toggleButton, authMode === 'sign-in' && styles.toggleButtonActive]} onPress={() => setAuthMode('sign-in')}>
              <Text style={[styles.toggleText, authMode === 'sign-in' && styles.toggleTextActive]}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, authMode === 'sign-up' && styles.toggleButtonActive]} onPress={() => setAuthMode('sign-up')}>
              <Text style={[styles.toggleText, authMode === 'sign-up' && styles.toggleTextActive]}>Create account</Text>
            </TouchableOpacity>
          </View>

          {authMode === 'sign-up' && (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#6d7078"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#6d7078"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6d7078"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {authMode === 'sign-up' && (
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#6d7078"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          )}

          {authError ? <Text style={styles.error}>{authError}</Text> : null}

          <TouchableOpacity style={styles.primaryButton} disabled={authBusy} onPress={() => void submitAuth()}>
            <Text style={styles.primaryButtonText}>{authBusy ? 'Processing…' : authMode === 'sign-in' ? 'Sign in' : 'Create account'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!canViewOperations) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Restricted area</Text>
          <Text style={styles.title}>Your role does not include operations controls.</Text>
          <Text style={styles.body}>
            Signed in as {user?.email}. Municipal staff or admin role is required to access triage and status updates.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => void signOut()}>
            <Text style={styles.secondaryButtonText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Operations center</Text>
        <Text style={styles.title}>Authenticated issue workflow.</Text>
        <Text style={styles.body}>Signed in as {user?.email}</Text>
      </View>

      <View style={styles.statsGrid}>
        {[
          { label: 'Total', value: overview?.stats.totalIssues ?? 0, tone: styles.statDark },
          { label: 'Open', value: overview?.stats.openIssues ?? 0, tone: styles.statWarning },
          { label: 'Resolved', value: overview?.stats.resolvedIssues ?? 0, tone: styles.statSuccess },
          { label: 'Rejected', value: overview?.stats.rejectedIssues ?? 0, tone: styles.statDanger },
        ].map((item) => (
          <View key={item.label} style={[styles.statCard, item.tone]}>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>Queue filters</Text>
        <TextInput
          style={styles.input}
          placeholder="Search issue title"
          placeholderTextColor="#6d7078"
          value={filters.q}
          onChangeText={(value) => setFilters((current) => ({ ...current, q: value, page: 1 }))}
        />

        <Text style={styles.filterLabel}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filters.status === 'all' && styles.filterChipActive]}
              onPress={() => setFilters((current) => ({ ...current, status: 'all', page: 1 }))}
            >
              <Text style={[styles.filterChipText, filters.status === 'all' && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, filters.status === status && styles.filterChipActive]}
                onPress={() => setFilters((current) => ({ ...current, status, page: 1 }))}
              >
                <Text style={[styles.filterChipText, filters.status === status && styles.filterChipTextActive]}>
                  {ISSUE_STATUS_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.filterLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filters.category === 'all' && styles.filterChipActive]}
              onPress={() => setFilters((current) => ({ ...current, category: 'all', page: 1 }))}
            >
              <Text style={[styles.filterChipText, filters.category === 'all' && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, filters.category === category && styles.filterChipActive]}
                onPress={() => setFilters((current) => ({ ...current, category, page: 1 }))}
              >
                <Text style={[styles.filterChipText, filters.category === category && styles.filterChipTextActive]}>
                  {ISSUE_CATEGORY_LABELS[category]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {queueError ? <Text style={styles.error}>{queueError}</Text> : null}

      {queueLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#0f1012" />
        </View>
      ) : (
        issues.map((issue) => {
          const nextStatus = nextStatusByIssue[issue.id] ?? issue.status;
          const statusColor = STATUS_COLORS[nextStatus];

          return (
            <View key={issue.id} style={styles.queueCard}>
              <Text style={styles.queueTitle}>{issue.title}</Text>
              <Text style={styles.queueMeta}>
                #{issue.id} • {ISSUE_CATEGORY_LABELS[issue.category]}
              </Text>
              <Text style={styles.queueMeta}>
                {issue.address || 'No precise address'} • {issue.latitude.toFixed(5)}, {issue.longitude.toFixed(5)}
              </Text>

              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>Current: {ISSUE_STATUS_LABELS[issue.status]}</Text>
              </View>

              <TouchableOpacity style={styles.secondaryButton} onPress={() => cycleStatus(issue.id)}>
                <Text style={styles.secondaryButtonText}>Next: {ISSUE_STATUS_LABELS[nextStatus]} (tap to cycle)</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Optional operator note"
                placeholderTextColor="#6d7078"
                value={noteByIssue[issue.id] ?? ''}
                onChangeText={(value) => setNoteByIssue((current) => ({ ...current, [issue.id]: value }))}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                disabled={savingIssueId === issue.id}
                onPress={() => void updateIssueStatus(issue.id)}
              >
                <Text style={styles.primaryButtonText}>{savingIssueId === issue.id ? 'Saving…' : 'Update status'}</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.secondaryButton, filters.page <= 1 && styles.disabledButton]}
          disabled={filters.page <= 1}
          onPress={() => setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
        >
          <Text style={styles.secondaryButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {filters.page}</Text>
        <TouchableOpacity
          style={[styles.secondaryButton, !hasMore && styles.disabledButton]}
          disabled={!hasMore}
          onPress={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
        >
          <Text style={styles.secondaryButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f1',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#6d7078',
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0c0c0d',
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4f535b',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    minHeight: 42,
    paddingHorizontal: 12,
    color: '#0c0c0d',
    fontSize: 14,
  },
  authToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: 'rgba(12,12,13,0.08)',
  },
  toggleButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#0f1012',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f535b',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  primaryButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#0f1012',
    backgroundColor: '#0f1012',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: '#0c0c0d',
    fontSize: 13,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  error: {
    borderWidth: 1,
    borderColor: '#fda29b',
    backgroundColor: '#fef3f2',
    color: '#b42318',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loader: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    gap: 8,
  },
  statCard: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    padding: 12,
  },
  statDark: {
    backgroundColor: '#111114',
  },
  statWarning: {
    backgroundColor: '#facc15',
  },
  statSuccess: {
    backgroundColor: '#15803d',
  },
  statDanger: {
    backgroundColor: '#b91c1c',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  statValue: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6d7078',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  filterChip: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  filterChipActive: {
    backgroundColor: '#0f1012',
    borderColor: '#0f1012',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f535b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  queueCard: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 10,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c0c0d',
  },
  queueMeta: {
    fontSize: 12,
    color: '#4f535b',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  pageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0c0c0d',
  },
});
