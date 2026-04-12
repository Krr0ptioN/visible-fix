import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import type { Issue } from '../../../libs/shared/types/src';
import { ISSUE_STATUS_LABELS, STATUS_COLORS } from '../../../libs/shared/types/src';

type RootStackParamList = {
  Main: undefined;
  IssueDetail: { issueId: string };
};

export default function MyIssuesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(async () => {
      try {
        const deviceId = await AsyncStorage.getItem('@visiblefix_device_id');
        if (!deviceId) return;
        
        const allIssues = await api.getIssues({ limit: 100 });
        const myIssues = allIssues.filter(i => i.reportedAt.includes(deviceId.substring(0, 20)));
        setIssues(myIssues);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      } finally {
        setLoading(false);
      }
    }, [])
  );

  const renderItem = ({ item }: { item: Issue }) => (
    <TouchableOpacity
      style={styles.issueCard}
      onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
    >
      <View style={styles.issueHeader}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.statusText}>{ISSUE_STATUS_LABELS[item.status]}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.reportedAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      <Text style={styles.issueTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.upvoteCount}>❤️ {item.upvoteCount} kişi destekledi</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (issues.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>Henüz bildirim yok</Text>
        <Text style={styles.emptySubtitle}>
          Bildirdiğiniz sorunlar burada görünecek
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  list: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  issueCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  issueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: '#6B7280' },
  issueTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  upvoteCount: { fontSize: 14, color: '#6B7280' },
});
