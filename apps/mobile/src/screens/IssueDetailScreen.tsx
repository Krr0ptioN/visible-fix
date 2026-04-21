import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { Issue } from '../../../../libs/shared/types/src';
import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS, STATUS_COLORS } from '../../../../libs/shared/types/src';
import { useDevice } from '../hooks/useDevice';
import api from '../services/api';

export default function IssueDetailScreen() {
  const route = useRoute();
  const { issueId } = route.params as { issueId: string };
  const { deviceId } = useDevice();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const issueData = await api.getIssueById(issueId);
        setIssue(issueData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load issue details.');
        console.error('Issue detail load failed:', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [issueId]);

  const timeline = useMemo(() => {
    if (!issue) return [];
    return [
      { key: 'reported', label: 'Reported', date: issue.reportedAt, color: STATUS_COLORS.reported },
      ...(issue.acknowledgedAt ? [{ key: 'acknowledged', label: 'Acknowledged', date: issue.acknowledgedAt, color: STATUS_COLORS.acknowledged }] : []),
      ...(issue.inProgressAt ? [{ key: 'in_progress', label: 'In progress', date: issue.inProgressAt, color: STATUS_COLORS.in_progress }] : []),
      ...(issue.resolvedAt ? [{ key: 'resolved', label: 'Resolved', date: issue.resolvedAt, color: STATUS_COLORS.resolved }] : []),
      ...(issue.rejectedAt ? [{ key: 'rejected', label: 'Rejected', date: issue.rejectedAt, color: STATUS_COLORS.rejected }] : []),
    ];
  }, [issue]);

  const handleUpvote = async () => {
    if (!issue || hasUpvoted || upvoting) return;

    setUpvoting(true);
    try {
      await api.createUpvote(issue.id, deviceId);
      setIssue((current) => (current ? { ...current, upvoteCount: current.upvoteCount + 1 } : null));
      setHasUpvoted(true);
    } catch (error) {
      console.error('Failed to upvote issue:', error);
      Alert.alert('Error', 'Unable to add support right now.');
    } finally {
      setUpvoting(false);
    }
  };

  const handleShare = async () => {
    if (!issue) return;
    await Share.share({
      message: `${issue.title}\nVisibleFix issue #${issue.id}`,
    });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#0f1012" />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Issue not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {issue.imageUrl ? <Image source={{ uri: issue.imageUrl }} style={styles.heroImage} /> : null}

      <View style={styles.card}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[issue.status] }]}>
          <Text style={styles.statusBadgeText}>{ISSUE_STATUS_LABELS[issue.status]}</Text>
        </View>
        <Text style={styles.category}>{ISSUE_CATEGORY_LABELS[issue.category]}</Text>
        <Text style={styles.title}>{issue.title}</Text>
        {issue.description ? <Text style={styles.description}>{issue.description}</Text> : null}
        <Text style={styles.meta}>
          {issue.address || 'No precise address'} • {issue.latitude.toFixed(5)}, {issue.longitude.toFixed(5)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Status timeline</Text>
        {timeline.map((entry, index) => (
          <View key={entry.key} style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: entry.color }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>{entry.label}</Text>
              <Text style={styles.timelineDate}>{new Date(entry.date).toLocaleDateString('tr-TR')}</Text>
            </View>
            {index < timeline.length - 1 ? <View style={styles.timelineConnector} /> : null}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.primaryButton, hasUpvoted && styles.disabledButton]} disabled={hasUpvoted || upvoting} onPress={() => void handleUpvote()}>
          <Text style={styles.primaryButtonText}>{hasUpvoted ? `Supported (${issue.upvoteCount})` : `Support (${issue.upvoteCount})`}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => void handleShare()}>
          <Text style={styles.secondaryButtonText}>Share</Text>
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
    padding: 12,
    gap: 10,
    paddingBottom: 24,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f1',
  },
  errorText: {
    fontSize: 14,
    color: '#b42318',
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  category: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6d7078',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0c0c0d',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4f535b',
  },
  meta: {
    fontSize: 12,
    color: '#4f535b',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#6d7078',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    paddingBottom: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    marginTop: 5,
  },
  timelineContent: {
    marginLeft: 10,
    gap: 2,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0c0c0d',
  },
  timelineDate: {
    fontSize: 12,
    color: '#4f535b',
  },
  timelineConnector: {
    position: 'absolute',
    left: 4,
    top: 14,
    width: 1,
    height: 14,
    backgroundColor: 'rgba(12,12,13,0.2)',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#0f1012',
    backgroundColor: '#0f1012',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  secondaryButtonText: {
    color: '#0f1012',
    fontSize: 13,
    fontWeight: '700',
  },
});
