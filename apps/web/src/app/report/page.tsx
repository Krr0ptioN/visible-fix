'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { CreateIssueInput, IssueCategory } from '@visiblefix/shared/types';

const API_BASE_URL = '/api/v1';

const CATEGORIES: Array<{ key: IssueCategory; label: string }> = [
  { key: 'pothole', label: 'Pothole' },
  { key: 'streetlight', label: 'Street light' },
  { key: 'waste', label: 'Waste' },
  { key: 'sidewalk', label: 'Sidewalk' },
  { key: 'water_leak', label: 'Water leak' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'other', label: 'Other' },
];

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

const createDeviceId = () => {
  if (typeof window === 'undefined') {
    return 'web-anonymous';
  }

  const existing = window.localStorage.getItem('visiblefix-device-id');
  if (existing) return existing;

  const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `vf-${Date.now()}`;
  window.localStorage.setItem('visiblefix-device-id', generated);
  return generated;
};

export default function ReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('other');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [deviceId, setDeviceId] = useState('web-anonymous');
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setDeviceId(createDeviceId());
  }, []);

  const imagePreviewUrl = useMemo(() => {
    if (!selectedImage) return null;
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const canSubmit = title.trim().length > 0 && latitude.trim().length > 0 && longitude.trim().length > 0;

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not available in this browser. Please enter coordinates manually.');
      return;
    }

    setLocationLoading(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocationLoading(false);
      },
      () => {
        setErrorMessage('Unable to fetch your location. Please enter coordinates manually.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setErrorMessage('Please complete title and location fields.');
      return;
    }

    const parsedLat = Number(latitude);
    const parsedLng = Number(longitude);

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      setErrorMessage('Latitude and longitude must be valid numbers.');
      return;
    }

    const payload: CreateIssueInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      imageUrl: imageUrl.trim() || undefined,
      latitude: parsedLat,
      longitude: parsedLng,
      deviceId,
    };

    setSubmitState('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Failed to submit report.');
      }

      setSubmitState('success');
      setTitle('');
      setDescription('');
      setCategory('other');
      setImageUrl('');
      setSelectedImage(null);
      setLatitude('');
      setLongitude('');
    } catch (error) {
      setSubmitState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error during submission.');
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-slate-900">
      <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-800">
        ← Back to home
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Report an issue</h1>
      <p className="mt-2 text-slate-600">Attach a photo, set location, and submit directly to the `/api/v1/issues` endpoint.</p>

      <form className="mt-8 space-y-8" onSubmit={onSubmit}>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1) Photo (camera or gallery)</h2>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
            className="block w-full rounded-md border border-slate-300 p-2 text-sm"
          />
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt="Selected issue preview" className="h-56 w-full rounded-md object-cover" />
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No photo selected yet.
            </div>
          )}
          <label className="block text-sm font-medium text-slate-700">
            Optional image URL (used by API for now)
            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="mt-1 block w-full rounded-md border border-slate-300 p-2"
            />
          </label>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2) Location (GPS + manual fallback)</h2>
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationLoading}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locationLoading ? 'Getting location…' : 'Use my current location'}
          </button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Latitude
              <input
                type="text"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="40.987654"
                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Longitude
              <input
                type="text"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="29.123456"
                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
              />
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3) Issue details</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCategory(item.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === item.key ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Large pothole near bus stop"
              className="mt-1 block w-full rounded-md border border-slate-300 p-2"
              maxLength={255}
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description (optional)
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add useful context for municipal teams"
              className="mt-1 block min-h-28 w-full rounded-md border border-slate-300 p-2"
              maxLength={2000}
            />
          </label>
        </section>

        <section className="space-y-3">
          <button
            type="submit"
            disabled={submitState === 'loading'}
            className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitState === 'loading' ? 'Submitting…' : 'Submit issue'}
          </button>

          {submitState === 'success' && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Report submitted successfully.
            </p>
          )}
          {(submitState === 'error' || errorMessage) && (
            <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{errorMessage}</p>
          )}
        </section>
      </form>
    </main>
  );
}
