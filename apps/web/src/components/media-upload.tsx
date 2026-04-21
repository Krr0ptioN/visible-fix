'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/components/i18n-provider';
import { Badge, Button, SectionEyebrow, cn } from '@/components/ui';

export type MediaItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  kind: 'image' | 'video';
  previewUrl: string;
};

const ACCEPTED_TYPES = ['image/', 'video/'];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isAcceptedFile = (file: File) => ACCEPTED_TYPES.some((prefix) => file.type.startsWith(prefix));

export function MediaUpload({
  value,
  onChange,
  maxFiles = 8,
}: {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxFiles?: number;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!value.length) {
      setActiveId(null);
      return;
    }

    if (!value.some((item) => item.id === activeId)) {
      setActiveId(value[0].id);
    }
  }, [activeId, value]);

  useEffect(() => {
    return () => {
      value.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [value]);

  const activeItem = useMemo(
    () => value.find((item) => item.id === activeId) ?? value[0] ?? null,
    [activeId, value]
  );

  const appendFiles = (files: FileList | File[]) => {
    const nextFiles = Array.from(files);
    if (!nextFiles.length) return;

    const accepted = nextFiles.filter(isAcceptedFile);
    if (accepted.length !== nextFiles.length) {
      setError(t('Only image and video files are allowed.'));
    } else {
      setError('');
    }

    const availableSlots = Math.max(maxFiles - value.length, 0);
    const limited = accepted.slice(0, availableSlots);
    if (!limited.length) return;

    const nextItems = limited.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      kind: file.type.startsWith('video/') ? 'video' : 'image',
      previewUrl: URL.createObjectURL(file),
    })) satisfies MediaItem[];

    onChange([...value, ...nextItems]);
  };

  const removeItem = (id: string) => {
    const target = value.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          appendFiles(event.dataTransfer.files);
        }}
        className={cn(
          'vf-grid-panel border border-border bg-card p-5 transition',
          isDragging ? 'border-foreground bg-secondary' : 'hover:bg-secondary'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(event) => {
            appendFiles(event.target.files ?? []);
            event.currentTarget.value = '';
          }}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <SectionEyebrow>{t('Media intake')}</SectionEyebrow>
            <p className="vf-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
              {t('Drop evidence here or browse your device.')}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                'Tailored to the current design system: hard edges, high contrast, and no decorative softness. Supports images and videos only.'
              )}
            </p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <Badge variant="subtle">
              {value.length}/{maxFiles} {t('files')}
            </Badge>
            <Button type="button" variant="outline">
              {t('Choose files')}
            </Button>
          </div>
        </div>
      </div>

      {error ? <div className="border border-[#fda29b] bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">{error}</div> : null}

      {activeItem ? (
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <SectionEyebrow>{t('Gallery view')}</SectionEyebrow>
                <p className="mt-1 text-sm font-semibold text-foreground">{activeItem.name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const index = value.findIndex((item) => item.id === activeItem.id);
                    const previous = value[(index - 1 + value.length) % value.length];
                    setActiveId(previous.id);
                  }}
                  disabled={value.length < 2}
                >
                  {t('Prev')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const index = value.findIndex((item) => item.id === activeItem.id);
                    const next = value[(index + 1) % value.length];
                    setActiveId(next.id);
                  }}
                  disabled={value.length < 2}
                >
                  {t('Next')}
                </Button>
              </div>
            </div>

            <div className="relative flex min-h-[360px] items-center justify-center bg-secondary p-4">
              {activeItem.kind === 'video' ? (
                <video
                  key={activeItem.id}
                  src={activeItem.previewUrl}
                  controls
                  className="max-h-[520px] w-full border border-border bg-black object-contain"
                />
              ) : (
                <img
                  key={activeItem.id}
                  src={activeItem.previewUrl}
                  alt={activeItem.name}
                  className="max-h-[520px] w-full border border-border object-contain"
                />
              )}
            </div>

            <div className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
              <div className="bg-card px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t('Type')}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{activeItem.kind}</p>
              </div>
              <div className="bg-card px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t('Format')}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{activeItem.type || t('Unknown')}</p>
              </div>
              <div className="bg-card px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t('Size')}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{formatBytes(activeItem.size)}</p>
              </div>
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <SectionEyebrow>{t('File list')}</SectionEyebrow>
              <p className="mt-1 text-sm text-muted-foreground">{t('Each upload can be reviewed, focused, or removed.')}</p>
            </div>
            <div className="grid gap-px bg-border">
              {value.map((item) => (
                <div key={item.id} className="grid grid-cols-[56px_1fr_auto] gap-3 bg-card px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      'flex h-14 w-14 items-center justify-center overflow-hidden border border-border bg-secondary transition',
                      activeItem.id === item.id ? 'border-foreground' : 'hover:border-foreground'
                    )}
                  >
                    {item.kind === 'video' ? (
                      <video src={item.previewUrl} className="h-full w-full object-cover" muted />
                    ) : (
                      <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {item.kind} / {formatBytes(item.size)}
                    </p>
                  </div>

                  <Button type="button" variant="ghost" onClick={() => removeItem(item.id)}>
                    {t('Remove')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-secondary px-6 py-10 text-center text-sm text-muted-foreground">
          {t('No files selected yet. Upload one or more images/videos to inspect them in gallery and list views.')}
        </div>
      )}
    </div>
  );
}
