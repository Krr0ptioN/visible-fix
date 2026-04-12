import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import type { Issue, IssueStatus, IssueCategory } from '../../../libs/shared/types/src';
import { ISSUE_STATUS_LABELS, STATUS_COLORS } from '../../../libs/shared/types/src';

type RootStackParamList = {
  Main: undefined;
  IssueDetail: { issueId: string };
};

const CATEGORIES: IssueCategory[] = ['pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other'];
const STATUSES: IssueStatus[] = ['reported', 'acknowledged', 'in_progress', 'resolved'];

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');

  const fetchIssues = useCallback(async () => {
    try {
      const filters: any = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      const data = await api.getIssues(filters);
      setIssues(data);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleMarkerPress = (issue: Issue) => {
    navigation.navigate('IssueDetail', { issueId: issue.id });
  };

  const renderMarker = (issue: Issue) => (
    <Marker
      key={issue.id}
      coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
      title={issue.title}
      description={ISSUE_STATUS_LABELS[issue.status]}
      pinColor={STATUS_COLORS[issue.status]}
      onPress={() => handleMarkerPress(issue)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', ...CATEGORIES]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === item && styles.filterChipActive]}
              onPress={() => setSelectedCategory(item as any)}
            >
              <Text style={[styles.filterText, selectedCategory === item && styles.filterTextActive]}>
                {item === 'all' ? 'Tümü' : item}
              </Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', ...STATUSES]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.statusChip, selectedStatus === item && { backgroundColor: STATUS_COLORS[item as IssueStatus] }]}
              onPress={() => setSelectedStatus(item as any)}
            >
              <Text style={[styles.statusText, selectedStatus === item && styles.statusTextActive]}>
                {item === 'all' ? 'Tümü' : ISSUE_STATUS_LABELS[item as IssueStatus]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 38.4237,
            longitude: 27.1428,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {issues.map(renderMarker)}
        </MapView>
      )}

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {issues.length} sorun haritada gösteriliyor
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filterContainer: { padding: 12, backgroundColor: '#f9fafb' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  filterText: { fontSize: 12, color: '#374151' },
  filterTextActive: { color: '#fff' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#e5e7eb', borderRadius: 12, marginRight: 8 },
  statusText: { fontSize: 11, color: '#374151' },
  statusTextActive: { color: '#fff' },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsBar: { padding: 12, backgroundColor: '#1E3A8A', alignItems: 'center' },
  statsText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
