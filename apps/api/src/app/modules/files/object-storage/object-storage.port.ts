export type ObjectStorageProvider = 'local' | 'minio' | 'gcs';

export type UploadObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
};

export type UploadObjectResult = {
  provider: ObjectStorageProvider;
  bucket: string;
  key: string;
  url: string;
  contentType: string;
  bytes: number;
};

export interface ObjectStoragePort {
  uploadObject(input: UploadObjectInput): Promise<UploadObjectResult>;
}

