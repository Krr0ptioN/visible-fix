'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { STATUS_COLORS, type IssueCategory, type IssueStatus } from '@visiblefix/shared/types';
import { useI18n } from '@/components/i18n-provider';
import { Card, CardContent, SectionEyebrow, cn } from '@/components/ui';

type MapPoint = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  status: IssueStatus;
  category?: IssueCategory;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

type GoogleMapProps = {
  points?: MapPoint[];
  selectedPointId?: string | null;
  onSelectPoint?: (id: string) => void;
  pickedLocation?: Coordinate | null;
  onPickLocation?: (coordinate: Coordinate) => void;
  className?: string;
  mode?: 'browse' | 'picker';
  interactive?: boolean;
  heightClassName?: string;
};

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID';
const CATEGORY_COLORS: Record<IssueCategory, string> = {
  pothole: '#ef4444',
  streetlight: '#f59e0b',
  waste: '#8b5cf6',
  sidewalk: '#10b981',
  water_leak: '#0ea5e9',
  accessibility: '#ec4899',
  other: '#64748b',
};
const CATEGORY_ICON_MARKUP: Record<IssueCategory, string> = {
  pothole: '<circle cx="12" cy="12" r="5" /><path d="M12 7v10M7 12h10" />',
  streetlight: '<path d="M12 3v14M8 7h8M8 11h8M9 21h6" />',
  waste: '<path d="M8 7h8M10 4h4M9 7v10M15 7v10" /><rect x="8" y="7" width="8" height="11" rx="1.5" />',
  sidewalk: '<rect x="5" y="5" width="14" height="14" rx="1.5" /><path d="M5 10h14M5 14h14M10 5v14M14 5v14" />',
  water_leak: '<path d="M12 3c-2.6 3.2-5.2 6-5.2 8.9A5.2 5.2 0 0 0 12 17a5.2 5.2 0 0 0 5.2-5.1C17.2 9 14.6 6.2 12 3z" /><path d="M9.5 12.5a2.6 2.6 0 0 0 2.5 2" />',
  accessibility:
    '<circle cx="9" cy="5.5" r="1.8" /><path d="M9 8.2v4.3M9 10.5l3.2 1.4" /><circle cx="14.8" cy="14.8" r="3.2" /><path d="M14.8 11.6v3.2h2.9" />',
  other: '<circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />',
};

const createCategoryMarkerElement = (category: IssueCategory, color: string, selected: boolean) => {
  const icon = document.createElement('div');
  icon.style.width = '18px';
  icon.style.height = '18px';
  icon.style.display = 'grid';
  icon.style.placeItems = 'center';
  icon.style.borderRadius = '9999px';
  icon.style.background = color;
  icon.style.border = selected ? '2px solid #111111' : '2px solid #ffffff';
  icon.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  icon.style.cursor = 'pointer';
  icon.style.color = '#ffffff';
  icon.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CATEGORY_ICON_MARKUP[category]}</svg>`;
  return icon;
};

const projectPoints = (points: Coordinate[]) => {
  if (points.length === 0) return [];

  const lats = points.map((point) => point.latitude);
  const lngs = points.map((point) => point.longitude);
  const latRange = Math.max(Math.max(...lats) - Math.min(...lats), 0.000001);
  const lngRange = Math.max(Math.max(...lngs) - Math.min(...lngs), 0.000001);
  const minLat = Math.min(...lats);
  const minLng = Math.min(...lngs);

  return points.map((point) => ({
    left: `${Math.min(Math.max(((point.longitude - minLng) / lngRange) * 100, 6), 94)}%`,
    top: `${Math.min(Math.max(100 - ((point.latitude - minLat) / latRange) * 100, 8), 92)}%`,
  }));
};

const defaultCenter = {
  lat: 41.0082,
  lng: 28.9784,
};

const ISTANBUL_BOUNDS: google.maps.LatLngBoundsLiteral = {
  north: 41.35,
  south: 40.8,
  west: 28.45,
  east: 29.4,
};

const isInsideIstanbul = (latitude: number, longitude: number) =>
  latitude >= ISTANBUL_BOUNDS.south &&
  latitude <= ISTANBUL_BOUNDS.north &&
  longitude >= ISTANBUL_BOUNDS.west &&
  longitude <= ISTANBUL_BOUNDS.east;

const clampToIstanbul = (latitude: number, longitude: number) => ({
  latitude: Math.min(Math.max(latitude, ISTANBUL_BOUNDS.south), ISTANBUL_BOUNDS.north),
  longitude: Math.min(Math.max(longitude, ISTANBUL_BOUNDS.west), ISTANBUL_BOUNDS.east),
});

export function GoogleMapComponent({
  points = [],
  selectedPointId,
  onSelectPoint,
  pickedLocation,
  onPickLocation,
  className,
  mode = 'browse',
  interactive = true,
  heightClassName = 'h-[460px]',
}: GoogleMapProps) {
  const { t, categoryLabel, statusLabel } = useI18n();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const markerRefs = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const markerListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const markerDomCleanupRef = useRef<Array<() => void>>([]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const center = useMemo(() => {
    if (mode === 'picker' && pickedLocation) {
      const clamped = clampToIstanbul(pickedLocation.latitude, pickedLocation.longitude);
      return { lat: clamped.latitude, lng: clamped.longitude };
    }
    const istanbulPoints = points.filter((point) => isInsideIstanbul(point.latitude, point.longitude));
    if (istanbulPoints.length === 1) {
      return { lat: istanbulPoints[0].latitude, lng: istanbulPoints[0].longitude };
    }
    return defaultCenter;
  }, [mode, pickedLocation, points]);

  const zoom = useMemo(() => {
    if (mode === 'picker') return 14;
    if (points.length === 1) return 14;
    return 11;
  }, [mode, points.length]);

  useEffect(() => {
    const istanbulPoints = points.filter((point) => isInsideIstanbul(point.latitude, point.longitude));
    if (map && istanbulPoints.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      istanbulPoints.forEach((point) => {
        bounds.extend({ lat: point.latitude, lng: point.longitude });
      });
      map.fitBounds(bounds, { top: 72, right: 72, bottom: 72, left: 72 });
    }
  }, [map, points]);

  const visiblePoints = useMemo(
    () => points.filter((point) => isInsideIstanbul(point.latitude, point.longitude)),
    [points]
  );

  const pickedLocationInBounds = useMemo(() => {
    if (!pickedLocation) return null;
    return clampToIstanbul(pickedLocation.latitude, pickedLocation.longitude);
  }, [pickedLocation]);

  useEffect(() => {
    if (!map || !window.google?.maps?.importLibrary) return;

    let disposed = false;

    const clearMarkers = () => {
      markerListenersRef.current.forEach((listener) => listener.remove());
      markerListenersRef.current = [];
      markerDomCleanupRef.current.forEach((fn) => fn());
      markerDomCleanupRef.current = [];
      markerRefs.current.forEach((marker) => {
        marker.map = null;
      });
      markerRefs.current.clear();
    };

    const mountAdvancedMarkers = async () => {
      const markerLib = (await window.google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
      if (disposed) return;

      clearMarkers();

      if (mode === 'picker' && pickedLocationInBounds) {
        const pin = new markerLib.PinElement({
          background: STATUS_COLORS['reported'],
          borderColor: '#000000',
          glyphColor: '#ffffff',
          scale: 0.95,
        });

        const marker = new markerLib.AdvancedMarkerElement({
          map,
          position: { lat: pickedLocationInBounds.latitude, lng: pickedLocationInBounds.longitude },
          content: pin.element,
          title: t('Selected location'),
        });
        markerRefs.current.set('picker', marker);
      }

      if (mode === 'browse') {
        visiblePoints.forEach((point) => {
          const fillColor = point.category ? CATEGORY_COLORS[point.category] : STATUS_COLORS[point.status];
          const category = point.category ?? 'other';
          const markerElement = createCategoryMarkerElement(category, fillColor, point.id === selectedPointId);

          const marker = new markerLib.AdvancedMarkerElement({
            map,
            position: { lat: point.latitude, lng: point.longitude },
            content: markerElement,
            title: point.title,
          });

          markerRefs.current.set(point.id, marker);

          if (onSelectPoint) {
            markerListenersRef.current.push(
              marker.addListener('gmp-click', () => {
                onSelectPoint(point.id);
              })
            );
          }

          const onMouseEnter = () => setHoveredPointId(point.id);
          const onMouseLeave = () => setHoveredPointId((current) => (current === point.id ? null : current));
          markerElement.addEventListener('mouseenter', onMouseEnter);
          markerElement.addEventListener('mouseleave', onMouseLeave);
          markerDomCleanupRef.current.push(() => {
            markerElement.removeEventListener('mouseenter', onMouseEnter);
            markerElement.removeEventListener('mouseleave', onMouseLeave);
          });
        });
      }
    };

    void mountAdvancedMarkers();

    return () => {
      disposed = true;
      clearMarkers();
    };
  }, [map, mode, onSelectPoint, pickedLocationInBounds, selectedPointId, visiblePoints]);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (mode === 'picker' && onPickLocation && e.latLng) {
        const rawLat = e.latLng.lat();
        const rawLng = e.latLng.lng();
        if (!isInsideIstanbul(rawLat, rawLng)) return;
        onPickLocation({
          latitude: Number(rawLat.toFixed(6)),
          longitude: Number(rawLng.toFixed(6)),
        });
      }
    },
    [mode, onPickLocation]
  );

  const fallbackCoordinates = useMemo(() => {
    if (mode === 'picker' && pickedLocationInBounds) {
      return [pickedLocationInBounds];
    }
    return visiblePoints.map((point) => ({ latitude: point.latitude, longitude: point.longitude }));
  }, [mode, pickedLocationInBounds, visiblePoints]);

  const fallbackPoints = useMemo(() => {
    if (mode !== 'browse') return [];
    return visiblePoints;
  }, [mode, visiblePoints]);

  const activePoint = useMemo(
    () => visiblePoints.find((point) => point.id === hoveredPointId) ?? visiblePoints.find((point) => point.id === selectedPointId) ?? null,
    [hoveredPointId, selectedPointId, visiblePoints]
  );

  if (!GOOGLE_MAPS_KEY || loadError) {
    const projected = projectPoints(fallbackCoordinates);

    return (
      <Card className={cn('relative overflow-hidden p-0', className)}>
        <div
          className={cn(
            'vf-grid-panel relative overflow-hidden border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,242,240,0.88))]',
            heightClassName
          )}
        >
          {projected.map((coordinate, index) => {
            const point = fallbackPoints[index];
            const isPicker = mode === 'picker' && pickedLocation;
            const status = point?.status ?? 'reported';
            const markerColor = point?.category ? CATEGORY_COLORS[point.category] : STATUS_COLORS[status];
            const active = isPicker || point?.id === selectedPointId;
            return (
              <span
                key={point?.id ?? `${coordinate.left}-${coordinate.top}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: coordinate.left, top: coordinate.top }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center border shadow-[0_12px_24px_rgba(0,0,0,0.16)]"
                  style={{ backgroundColor: markerColor, borderColor: active ? '#000000' : 'rgba(255,255,255,0.92)' }}
                >
                  <span className="h-1.5 w-1.5 bg-white" />
                </span>
              </span>
            );
          })}
            <Card className="absolute left-4 top-4 max-w-[240px] border-foreground bg-card/94 shadow-tight">
              <CardContent className="space-y-2 p-4">
                <SectionEyebrow>{t('Map preview')}</SectionEyebrow>
                <p className="text-sm font-semibold text-foreground">{t('Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable the live map layer.')}</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {t('The fallback keeps the layout functional, but the full Google Maps view is the intended spatial surface.')}
                </p>
              </CardContent>
            </Card>
        </div>
      </Card>
    );
  }

  return isLoaded ? (
    <div className={cn('vf-map-shell relative overflow-hidden border border-border bg-card shadow-panel', className)}>
      <GoogleMap
        mapContainerClassName={heightClassName}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          disableDefaultUI: !interactive,
          zoomControl: interactive,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          restriction: {
            latLngBounds: ISTANBUL_BOUNDS,
            strictBounds: true,
          },
          minZoom: 10,
          mapId: GOOGLE_MAP_ID,
        }}
      >
        {mode === 'browse' && activePoint && (
          <InfoWindow position={{ lat: activePoint.latitude, lng: activePoint.longitude }}>
            <div style={{ padding: '8px 4px', minWidth: '150px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)', fontWeight: 700 }}>VisibleFix</div>
              <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 700, color: '#000' }}>{activePoint.title}</div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: '#000000aa' }}>
                {activePoint.category ? categoryLabel(activePoint.category) : t('Issue')}
              </div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: '#000000aa' }}>{statusLabel(activePoint.status)}</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : (
    <div className={cn('vf-map-shell relative overflow-hidden border border-border bg-card shadow-panel', className)}>
      <div className={cn('flex items-center justify-center bg-white/70 backdrop-blur-sm', heightClassName)}>
        <div className="border border-foreground bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground">
          {t('Loading map')}
        </div>
      </div>
    </div>
  );
}
