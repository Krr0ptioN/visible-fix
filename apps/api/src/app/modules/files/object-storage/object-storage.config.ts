import { isAbsolute, join } from 'node:path';
import type { ObjectStorageProvider } from './object-storage.port';

export const OBJECT_STORAGE_CONFIG = Symbol('OBJECT_STORAGE_CONFIG');
export const OBJECT_STORAGE_PORT = Symbol('OBJECT_STORAGE_PORT');

export type ObjectStorageConfig = {
  provider: ObjectStorageProvider;
  bucket: string;
  publicBaseUrl: string;
  maxFileSizeBytes: number;
  localRootDir: string;
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  gcsProjectId?: string;
  gcsKeyFilename?: string;
  gcsMakePublic: boolean;
};

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const resolveProvider = (provider: string | undefined): ObjectStorageProvider => {
  const normalized = (provider ?? 'local').trim().toLowerCase();
  if (normalized === 'gcs' || normalized === 'google' || normalized === 'google-cloud-storage') return 'gcs';
  if (normalized === 'minio' || normalized === 's3') return 'minio';
  return 'local';
};

export const getObjectStorageConfig = (env: NodeJS.ProcessEnv = process.env): ObjectStorageConfig => {
  const provider = resolveProvider(env.OBJECT_STORAGE_PROVIDER);
  const apiPort = env.API_PORT ?? '8030';
  const configuredLocalRoot = env.LOCAL_OBJECT_STORAGE_ROOT ?? 'storage';
  const localRootDir = isAbsolute(configuredLocalRoot) ? configuredLocalRoot : join(process.cwd(), configuredLocalRoot);
  const defaultPublicBaseUrl = `http://localhost:${apiPort}/uploads`;

  return {
    provider,
    bucket: env.OBJECT_STORAGE_BUCKET ?? 'visiblefix-dev',
    publicBaseUrl: env.OBJECT_STORAGE_PUBLIC_BASE_URL ?? defaultPublicBaseUrl,
    maxFileSizeBytes: Number(env.OBJECT_STORAGE_MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024),
    localRootDir,
    endpoint: env.OBJECT_STORAGE_ENDPOINT ?? 'http://localhost:9000',
    region: env.OBJECT_STORAGE_REGION ?? 'us-east-1',
    accessKey: env.OBJECT_STORAGE_ACCESS_KEY ?? 'minioadmin',
    secretKey: env.OBJECT_STORAGE_SECRET_KEY ?? 'minioadmin',
    gcsProjectId: env.GCS_PROJECT_ID,
    gcsKeyFilename: env.GCS_KEY_FILENAME,
    gcsMakePublic: toBoolean(env.GCS_MAKE_PUBLIC, true),
  };
};

