import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types';

const METRICS = [
  { label: 'Report time', value: '<60s' },
  { label: 'Public status flow', value: '5 states' },
  { label: 'Map-first scan', value: 'Live' },
];

export default function OverviewScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>VisibleFix / Civic trust-powered reporting</Text>
        <Text style={styles.title}>Report city issues. Track progress. Drive real change.</Text>
        <Text style={styles.description}>
          VisibleFix is a public platform for reporting infrastructure problems and tracking status in a transparent, map-first control surface.
        </Text>

        <View style={styles.metricsGrid}>
          {METRICS.map((metric) => (
            <View key={metric.label} style={styles.metricCell}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate('Report')}>
            <Text style={styles.primaryActionText}>Open report intake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate('Discovery')}>
            <Text style={styles.secondaryActionText}>View issue grid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate('Operations')}>
            <Text style={styles.secondaryActionText}>Open operations</Text>
          </TouchableOpacity>
        </View>
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
  },
  heroCard: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: 16,
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#6d7078',
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    color: '#0c0c0d',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4f535b',
  },
  metricsGrid: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: 'rgba(12,12,13,0.14)',
  },
  metricCell: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#6d7078',
  },
  metricValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '800',
    color: '#0c0c0d',
  },
  actions: {
    gap: 8,
  },
  primaryAction: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#0f1012',
    backgroundColor: '#0f1012',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryAction: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryActionText: {
    color: '#0c0c0d',
    fontSize: 14,
    fontWeight: '700',
  },
});
