'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CreateIssueInput, IssueCategory } from '@visiblefix/shared/types';
import { useI18n } from '@/components/i18n-provider';
import { GoogleMapComponent as GoogleMap } from '@/components/google-map';
import { MediaUpload, type MediaItem } from '@/components/media-upload';
import { SiteShell } from '@/components/site-shell';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SectionEyebrow, Textarea, cn } from '@/components/ui';

const API_BASE_URL = '/api/v1';
const ISTANBUL_CENTER = { latitude: 41.0082, longitude: 28.9784 };
const ISTANBUL_BOUNDS = {
  north: 41.35,
  south: 40.8,
  west: 28.45,
  east: 29.4,
};

const CATEGORIES: IssueCategory[] = ['pothole', 'streetlight', 'waste', 'sidewalk', 'water_leak', 'accessibility', 'other'];

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

const createDeviceId = () => {
  if (typeof window === 'undefined') return 'web-anonymous';

  const existing = window.localStorage.getItem('visiblefix-device-id');
  if (existing) return existing;

  const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `vf-${Date.now()}`;
  window.localStorage.setItem('visiblefix-device-id', generated);
  return generated;
};

export default function ReportPage() {
  const { t, categoryLabel } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('other');
  const [imageUrl, setImageUrl] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [deviceId, setDeviceId] = useState('web-anonymous');
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setDeviceId(createDeviceId());
  }, []);

  const pickedLocation = useMemo(() => {
    const parsedLat = Number(latitude);
    const parsedLng = Number(longitude);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return null;
    return { latitude: parsedLat, longitude: parsedLng };
  }, [latitude, longitude]);

  const canSubmit = title.trim().length > 0 && latitude.trim().length > 0 && longitude.trim().length > 0;

  const setIstanbulFallback = () => {
    setLatitude(ISTANBUL_CENTER.latitude.toFixed(6));
    setLongitude(ISTANBUL_CENTER.longitude.toFixed(6));
  };

  const clampToIstanbul = (lat: number, lng: number) => ({
    latitude: Math.min(Math.max(lat, ISTANBUL_BOUNDS.south), ISTANBUL_BOUNDS.north),
    longitude: Math.min(Math.max(lng, ISTANBUL_BOUNDS.west), ISTANBUL_BOUNDS.east),
  });

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setIstanbulFallback();
      setErrorMessage(t('Geolocation is not available. Defaulted to Istanbul center; adjust on the map if needed.'));
      return;
    }

    setLocationLoading(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const clamped = clampToIstanbul(position.coords.latitude, position.coords.longitude);
        setLatitude(clamped.latitude.toFixed(6));
        setLongitude(clamped.longitude.toFixed(6));
        setLocationLoading(false);
      },
      (error) => {
        setIstanbulFallback();
        const reason = error.code === 1 ? t('Location permission was denied.') : t('Unable to fetch your current location.');
        setErrorMessage(t('{reason} Defaulted to Istanbul center; adjust on the map if needed.', { reason }));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setErrorMessage(t('Please complete title and location fields.'));
      return;
    }

    const parsedLat = Number(latitude);
    const parsedLng = Number(longitude);

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      setErrorMessage(t('Latitude and longitude must be valid numbers.'));
      return;
    }

    if (
      parsedLat < ISTANBUL_BOUNDS.south ||
      parsedLat > ISTANBUL_BOUNDS.north ||
      parsedLng < ISTANBUL_BOUNDS.west ||
      parsedLng > ISTANBUL_BOUNDS.east
    ) {
      setErrorMessage(t('This deployment accepts report locations in Istanbul bounds only.'));
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || t('Failed to submit report.'));
      }

      setSubmitState('success');
      setTitle('');
      setDescription('');
      setCategory('other');
      setImageUrl('');
      setMediaItems([]);
      setLatitude('');
      setLongitude('');
    } catch (error) {
      setSubmitState('error');
      setErrorMessage(error instanceof Error ? error.message : t('Unexpected error during submission.'));
    }
  };

  return (
    <SiteShell activePage="report">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <SectionEyebrow>{t('Citizen intake')}</SectionEyebrow>
            <CardTitle className="mt-3 text-4xl">{t('Report an issue with less friction and more precision.')}</CardTitle>
            <CardDescription>
              {t('Use the map or your current GPS position, attach optional evidence, and send a cleaner record into the public issue workflow.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={onSubmit}>
              <section className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('1. Category')}</p>
                  <div className="mt-3 grid gap-px border border-border bg-border sm:grid-cols-2">
                    {CATEGORIES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={cn(
                          'min-h-11 bg-card px-4 text-left text-sm font-medium transition',
                          category === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        {categoryLabel(item)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    {t('Title')}
                    <Input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={t('Large pothole near bus stop')}
                      maxLength={255}
                      required
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    {t('Description')}
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder={t('What should municipal teams know before they arrive?')}
                      maxLength={2000}
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('2. Media evidence')}</p>
                <MediaUpload value={mediaItems} onChange={setMediaItems} />

                <label className="grid gap-2 text-sm font-medium text-foreground">
                  {t('Optional hosted asset URL')}
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder={t('https://example.com/evidence.jpg')}
                  />
                </label>
                <p className="text-xs leading-5 text-muted-foreground">
                  {t(
                    'The current API persists `imageUrl` only. Uploaded media is fully previewable and removable in the UI now; wiring binary upload to storage is the next backend step.'
                  )}
                </p>
              </section>

              <section className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('3. Submit')}</p>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={submitState === 'loading'}>
                    {submitState === 'loading' ? t('Submitting…') : t('Submit issue')}
                  </Button>
                  <Button type="button" variant="outline" onClick={requestLocation} disabled={locationLoading}>
                    {locationLoading ? t('Getting location…') : t('Use current location')}
                  </Button>
                </div>

                {submitState === 'success' ? (
                  <div className="border border-[#12b76a] bg-[#ecfdf3] px-4 py-3 text-sm text-[#067647]">{t('Report submitted successfully.')}</div>
                ) : null}
                {(submitState === 'error' || errorMessage) && (
                  <div className="border border-[#fda29b] bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">{errorMessage}</div>
                )}
              </section>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <SectionEyebrow>{t('Spatial input')}</SectionEyebrow>
              <CardTitle className="mt-3 text-3xl">{t('Pick the exact location.')}</CardTitle>
              <CardDescription>
                {t('Click directly on the map to set coordinates, or use device geolocation for a faster starting point.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleMap
                mode="picker"
                pickedLocation={pickedLocation}
                onPickLocation={(coordinate) => {
                  setLatitude(String(coordinate.latitude));
                  setLongitude(String(coordinate.longitude));
                }}
                className="border-0 shadow-none"
                heightClassName="h-[380px]"
              />
              <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
                <div className="bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('Latitude')}</p>
                  <Input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="40.987654" className="mt-3" />
                </div>
                <div className="bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('Longitude')}</p>
                  <Input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="29.123456" className="mt-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
