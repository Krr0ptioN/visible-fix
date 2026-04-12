import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useDevice } from '../hooks/useDevice';
import type { IssueCategory } from '../../../libs/shared/types/src';

const CATEGORIES: { key: IssueCategory; label: string }[] = [
  { key: 'pothole', label: 'Çukur' },
  { key: 'streetlight', label: 'Sokak Lambası' },
  { key: 'waste', label: 'Atık' },
  { key: 'sidewalk', label: 'Kaldırım' },
  { key: 'water_leak', label: 'Su Kaçağı' },
  { key: 'accessibility', label: 'Erişilebilirlik' },
  { key: 'other', label: 'Diğer' },
];

export default function ReportScreen() {
  const navigation = useNavigation();
  const { deviceId } = useDevice();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('other');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum izni gerekli', 'Sorunun yerini belirlemek için konum izni verin.');
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Hata', 'Konum alınamadı');
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen bir başlık girin');
      return;
    }
    if (!location) {
      Alert.alert('Hata', 'Lütfen konum belirleyin');
      return;
    }

    setLoading(true);
    try {
      const issue = await api.createIssue({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        latitude: location.latitude,
        longitude: location.longitude,
        deviceId,
      });
      
      Alert.alert('Başarılı!', 'Sorununuz bildirildi.', [
        { text: 'Tamam', onPress: () => {
          setTitle('');
          setDescription('');
          setCategory('other');
          setImage(null);
          setLocation(null);
        }}
      ]);
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert('Hata', error?.message || 'Sorun bildirilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Sorunun Fotoğrafı</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷 Fotoğraf Çek</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Konum</Text>
      <TouchableOpacity 
        style={[styles.locationButton, location && styles.locationButtonActive]} 
        onPress={requestLocation}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <ActivityIndicator color="#fff" />
        ) : location ? (
          <Text style={styles.locationButtonText}>✓ Konum Alındı</Text>
        ) : (
          <Text style={styles.locationButtonText}>📍 Konum Belirle</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Kategori</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
            onPress={() => setCategory(cat.key)}
          >
            <Text style={[styles.categoryText, category === cat.key && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Başlık</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Kısa bir başlık girin"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.sectionTitle}>Açıklama (İsteğe Bağlı)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Sorunu detaylı olarak açıklayın"
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Sorun Bildir</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 16, marginBottom: 8 },
  imagePicker: { height: 200, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D5DB', borderRadius: 12 },
  imagePlaceholderText: { fontSize: 16, color: '#6B7280' },
  locationButton: { backgroundColor: '#1E3A8A', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  locationButtonActive: { backgroundColor: '#10B981' },
  locationButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F3F4F6', borderRadius: 20 },
  categoryChipActive: { backgroundColor: '#1E3A8A' },
  categoryText: { fontSize: 14, color: '#374151' },
  categoryTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#1E3A8A', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
