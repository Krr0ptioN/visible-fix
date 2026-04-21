import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Issue, IssueCategory, IssueStatus } from '../../../../libs/shared/types/src';
import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS } from '../../../../libs/shared/types/src';
import type { RootStackParamList } from '../navigation/types';
import api from '../services/api';

const CATEGORIES: Array<IssueCategory | 'all'> = ['all', 'pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other'];
const STATUSES: Array<IssueStatus | 'all'> = ['all', 'reported', 'acknowledged', 'in_progress', 'resolved', 'rejected'];
const SHEET_SNAP_ORDER = ['peek', 'half', 'full'] as const;
type SheetSnap = (typeof SHEET_SNAP_ORDER)[number];

const CATEGORY_MARKER_COLOR: Record<IssueCategory, string> = {
  pothole: '#111114',
  streetlight: '#283349',
  waste: '#2e3d2e',
  sidewalk: '#4a4a4d',
  water_leak: '#004d73',
  accessibility: '#5a247f',
  other: '#5f636b',
};

const CATEGORY_ICON: Record<IssueCategory, string> = {
  pothole: 'P',
  streetlight: 'L',
  waste: 'W',
  sidewalk: 'S',
  water_leak: 'H',
  accessibility: 'A',
  other: 'O',
};

const SHEET_RATIO: Record<SheetSnap, number> = {
  peek: 0.22,
  half: 0.46,
  full: 0.78,
};

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('half');

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getIssues({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        limit: 120,
      });
      setIssues(data);
      setSelectedIssueId((current) => (current && data.some((issue) => issue.id === current) ? current : data[0]?.id ?? null));
    } catch (error) {
      console.error('Failed to load discovery map issues:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    void fetchIssues();
  }, [fetchIssues]);

  const selectedIssue = useMemo(() => issues.find((issue) => issue.id === selectedIssueId) ?? null, [issues, selectedIssueId]);
  const sheetHeight = Dimensions.get('window').height * SHEET_RATIO[sheetSnap];

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 41.0082,
          longitude: 28.9784,
          latitudeDelta: 0.18,
          longitudeDelta: 0.18,
        }}
      >
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
            onPress={() => {
              setSelectedIssueId(issue.id);
              setSheetSnap('half');
            }}
          >
            <View style={[styles.marker, { backgroundColor: CATEGORY_MARKER_COLOR[issue.category] }]}>
              <Text style={styles.markerText}>{CATEGORY_ICON[issue.category]}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.filtersOverlay}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === item && styles.filterChipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.filterChipText, selectedCategory === item && styles.filterChipTextActive]}>
                {item === 'all' ? 'All categories' : ISSUE_CATEGORY_LABELS[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          horizontal
          data={STATUSES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.filterChip, selectedStatus === item && styles.filterChipActive]} onPress={() => setSelectedStatus(item)}>
              <Text style={[styles.filterChipText, selectedStatus === item && styles.filterChipTextActive]}>
                {item === 'all' ? 'All statuses' : ISSUE_STATUS_LABELS[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeaderLabel}>Discovery queue</Text>
          <Text style={styles.sheetHeaderLabel}>{isLoading ? 'Loading…' : `${issues.length} visible`}</Text>
        </View>
        <View style={styles.snapRow}>
          {SHEET_SNAP_ORDER.map((snap) => (
            <TouchableOpacity key={snap} style={[styles.snapButton, sheetSnap === snap && styles.snapButtonActive]} onPress={() => setSheetSnap(snap)}>
              <Text style={[styles.snapButtonText, sheetSnap === snap && styles.snapButtonTextActive]}>{snap}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedIssue ? (
          <View style={styles.focusedRecord}>
            <Text style={styles.focusedTitle}>{selectedIssue.title}</Text>
            <Text style={styles.focusedMeta}>
              {ISSUE_STATUS_LABELS[selectedIssue.status]} • {ISSUE_CATEGORY_LABELS[selectedIssue.category]}
            </Text>
            <TouchableOpacity style={styles.openIssueButton} onPress={() => navigation.navigate('IssueDetail', { issueId: selectedIssue.id })}>
              <Text style={styles.openIssueButtonText}>Open full issue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.focusedRecord}>
            <Text style={styles.focusedMeta}>Select an issue marker or row to focus details.</Text>
          </View>
        )}

        <FlatList
          data={issues}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.issueListContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.issueRow, selectedIssueId === item.id && styles.issueRowActive]}
              onPress={() => setSelectedIssueId(item.id)}
            >
              <View style={[styles.issueCategoryDot, { backgroundColor: CATEGORY_MARKER_COLOR[item.category] }]} />
              <View style={styles.issueRowContent}>
                <Text numberOfLines={2} style={styles.issueRowTitle}>
                  {item.title}
                </Text>
                <Text style={styles.issueRowMeta}>
                  {ISSUE_STATUS_LABELS[item.status]} • {ISSUE_CATEGORY_LABELS[item.category]}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f1',
  },
  marker: {
    minWidth: 24,
    minHeight: 24,
    borderWidth: 1,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  markerText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  filtersOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    gap: 6,
  },
  filterRow: {
    gap: 6,
  },
  filterChip: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.18)',
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  filterChipActive: {
    borderColor: '#0f1012',
    backgroundColor: '#0f1012',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f535b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f3f1',
    borderTopWidth: 1,
    borderTopColor: 'rgba(12,12,13,0.18)',
  },
  sheetHandle: {
    width: 48,
    height: 4,
    backgroundColor: 'rgba(12,12,13,0.3)',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  sheetHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#6d7078',
  },
  snapRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(12,12,13,0.14)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(12,12,13,0.14)',
  },
  snapButton: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
  },
  snapButtonActive: {
    backgroundColor: '#0f1012',
  },
  snapButtonText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#4f535b',
  },
  snapButtonTextActive: {
    color: '#ffffff',
  },
  focusedRecord: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(12,12,13,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    gap: 6,
  },
  focusedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0c0c0d',
  },
  focusedMeta: {
    fontSize: 12,
    color: '#4f535b',
  },
  openIssueButton: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f1',
  },
  openIssueButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f1012',
  },
  issueListContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    padding: 10,
    gap: 8,
  },
  issueRowActive: {
    borderColor: '#0f1012',
    backgroundColor: '#ececef',
  },
  issueCategoryDot: {
    width: 10,
    height: 10,
    marginTop: 4,
  },
  issueRowContent: {
    flex: 1,
    gap: 4,
  },
  issueRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0c0c0d',
  },
  issueRowMeta: {
    fontSize: 11,
    color: '#6d7078',
  },
});
