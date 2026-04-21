import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Issue } from '../../../../libs/shared/types/src';
import { ISSUE_STATUS_LABELS, STATUS_COLORS } from '../../../../libs/shared/types/src';
import type { RootStackParamList } from '../navigation/types';
import api from '../services/api';
import { getReportedIssueIds } from '../services/reported-issues';

export default function MyIssuesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const load = async () => {
        setLoading(true);
        try {
          const [allIssues, reportedIssueIds] = await Promise.all([api.getIssues({ limit: 150 }), getReportedIssueIds()]);
          if (!mounted) return;
          setIssues(allIssues.filter((issue) => reportedIssueIds.includes(issue.id)));
        } catch (error) {
          console.error('Failed to load reported issues:', error);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      void load();

      return () => {
        mounted = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#0f1012" />
      </View>
    );
  }

  if (issues.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No submitted issues yet.</Text>
        <Text style={styles.emptyBody}>Reports you create on this device will appear in this list.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={issues}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
            <Text style={styles.statusText}>{ISSUE_STATUS_LABELS[item.status]}</Text>
          </View>
          <Text style={styles.meta}>
            {new Date(item.reportedAt).toLocaleDateString('tr-TR')} • ❤️ {item.upvoteCount}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f3f3f1',
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f1',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f1',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0c0c0d',
  },
  emptyBody: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    color: '#4f535b',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0c0c0d',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    color: '#4f535b',
  },
});
