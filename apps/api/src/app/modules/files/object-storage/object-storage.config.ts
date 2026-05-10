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
