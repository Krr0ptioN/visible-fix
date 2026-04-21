import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import type { IssueCategory } from '../../../../libs/shared/types/src';
import { ISSUE_CATEGORY_LABELS } from '../../../../libs/shared/types/src';
import { useDevice } from '../hooks/useDevice';
import api from '../services/api';
import { addReportedIssueId } from '../services/reported-issues';

const CATEGORIES: IssueCategory[] = ['pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other'];

export default function ReportScreen() {
  const { deviceId } = useDevice();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('other');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const requestCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location required', 'Please allow location permission to submit a precise report.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Location error', 'Unable to access your location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Camera error', 'Unable to capture image right now.');
    }
  };

  const submit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }

    if (!location) {
      Alert.alert('Validation', 'Location is required.');
      return;
    }

    setSubmitting(true);
    try {
      const issue = await api.createIssue({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: imageUri || undefined,
        deviceId,
      });

      await addReportedIssueId(issue.id);

      setTitle('');
      setDescription('');
      setCategory('other');
      setImageUri(null);
      setLocation(null);
      Alert.alert('Submitted', 'Your report was published successfully.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      Alert.alert('Submission error', error instanceof Error ? error.message : 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Citizen intake</Text>
        <Text style={styles.title}>Report with less friction and more precision.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Evidence</Text>
        <TouchableOpacity style={styles.mediaSurface} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.mediaImage} />
          ) : (
            <Text style={styles.mediaPlaceholder}>Tap to capture photo evidence</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Location</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => void requestCurrentLocation()} disabled={locationLoading}>
          {locationLoading ? <ActivityIndicator color="#0f1012" /> : <Text style={styles.secondaryButtonText}>{location ? 'Location captured' : 'Use current location'}</Text>}
        </TouchableOpacity>
        {location ? (
          <Text style={styles.metaText}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.metaText}>Capture location before submitting.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((entry) => (
            <TouchableOpacity key={entry} style={[styles.categoryChip, category === entry && styles.categoryChipActive]} onPress={() => setCategory(entry)}>
              <Text style={[styles.categoryChipText, category === entry && styles.categoryChipTextActive]}>{ISSUE_CATEGORY_LABELS[entry]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Large pothole near bus stop"
          placeholderTextColor="#6d7078"
        />

        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="What should municipal teams know before they arrive?"
          placeholderTextColor="#6d7078"
          multiline
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} disabled={submitting} onPress={() => void submit()}>
        {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Submit issue</Text>}
      </TouchableOpacity>
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
    gap: 10,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    padding: 12,
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
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0c0c0d',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#6d7078',
  },
  mediaSurface: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ececef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaImage: {
    width: '100%',
    height: 220,
  },
  mediaPlaceholder: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4f535b',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#0c0c0d',
  },
  metaText: {
    fontSize: 12,
    color: '#4f535b',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: 'rgba(12,12,13,0.14)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  categoryChipActive: {
    borderColor: '#0f1012',
    backgroundColor: '#0f1012',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f535b',
  },
  categoryChipTextActive: {
    color: '#ffffff',
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
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  primaryButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#0f1012',
    backgroundColor: '#0f1012',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
