import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useDevice } from '../hooks/useDevice';
import type { Issue } from '../../../libs/shared/types/src';
import { ISSUE_STATUS_LABELS, STATUS_COLORS, ISSUE_CATEGORY_LABELS } from '../../../libs/shared/types/src';

export default function IssueDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { issueId } = route.params as { issueId: string };
  const { deviceId } = useDevice();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const data = await api.getIssueById(issueId);
        setIssue(data);
      } catch (error) {
        console.error('Failed to fetch issue:', error);
        Alert.alert('Hata', 'Sorun detayları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [issueId]);

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setUpvoting(true);
    try {
      await api.createUpvote(issueId, deviceId);
      setHasUpvoted(true);
      setIssue(prev => prev ? { ...prev, upvoteCount: prev.upvoteCount + 1 } : null);
    } catch (error) {
      console.error('Upvote error:', error);
    } finally {
      setUpvoting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${issue?.title}\nVisibleFix'te görüntüle: visiblefix.app/issue/${issueId}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Sorun bulunamadı</Text>
      </View>
    );
  }

  const timeline = [
    { status: 'reported', date: issue.reportedAt, label: 'Bildirildi' },
    ...(issue.acknowledgedAt ? [{ status: 'acknowledged', date: issue.acknowledgedAt, label: 'İnceleniyor' }] : []),
    ...(issue.inProgressAt ? [{ status: 'in_progress', date: issue.inProgressAt, label: 'Çalışılıyor' }] : []),
    ...(issue.resolvedAt ? [{ status: 'resolved', date: issue.resolvedAt, label: 'Çözüldü' }] : []),
    ...(issue.rejectedAt ? [{ status: 'rejected', date: issue.rejectedAt, label: 'Reddedildi' }] : []),
  ];

  return (
    <ScrollView style={styles.container}>
      {issue.imageUrl && (
        <Image source={{ uri: issue.imageUrl }} style={styles.heroImage} />
      )}
      
      <View style={styles.content}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[issue.status] }]}>
          <Text style={styles.statusText}>{ISSUE_STATUS_LABELS[issue.status]}</Text>
        </View>

        <Text style={styles.category}>{ISSUE_CATEGORY_LABELS[issue.category]}</Text>
        <Text style={styles.title}>{issue.title}</Text>
        
        {issue.description && (
          <Text style={styles.description}>{issue.description}</Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.meta}>📍 {issue.address || 'Konum belirtilmemiş'}</Text>
          <Text style={styles.meta}>📅 {new Date(issue.reportedAt).toLocaleDateString('tr-TR')}</Text>
        </View>

        <Text style={styles.sectionTitle}>Durum Geçmişi</Text>
        <View style={styles.timeline}>
          {timeline.map((item, index) => (
            <View key={item.status} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] }]} />
              {index < timeline.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>{item.label}</Text>
                <Text style={styles.timelineDate}>
                  {new Date(item.date).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.upvoteButton, hasUpvoted && styles.upvoteButtonActive]}
            onPress={handleUpvote}
            disabled={hasUpvoted || upvoting}
          >
            <Text style={styles.upvoteButtonText}>
              {hasUpvoted ? '✓ ' : '👍 '}
              {issue.upvoteCount} Destek
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤 Paylaş</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#EF4444' },
  heroImage: { width: '100%', height: 250, backgroundColor: '#F3F4F6' },
  content: { padding: 16 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 12 },
  statusText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  category: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  description: { fontSize: 16, color: '#4B5563', lineHeight: 24, marginBottom: 16 },
  metaRow: { marginBottom: 24 },
  meta: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  timeline: { marginBottom: 24 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginLeft: 5, marginTop: 6 },
  timelineContent: { marginLeft: 12, flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  timelineDate: { fontSize: 12, color: '#6B7280' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  upvoteButton: { flex: 1, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  upvoteButtonActive: { backgroundColor: '#1E3A8A' },
  upvoteButtonText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  shareButton: { flex: 1, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  shareButtonText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
});
