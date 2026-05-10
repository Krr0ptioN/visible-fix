import { Inject, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { OBJECT_STORAGE_CONFIG, type ObjectStorageConfig } from './object-storage.config';
import type { ObjectStoragePort, UploadObjectInput, UploadObjectResult } from './object-storage.port';

@Injectable()
export class GcsObjectStorageAdapter implements ObjectStoragePort {
  private readonly storage: Storage;

  constructor(@Inject(OBJECT_STORAGE_CONFIG) private readonly config: ObjectStorageConfig) {
    this.storage = new Storage({
      projectId: this.config.gcsProjectId,
      keyFilename: this.config.gcsKeyFilename,
    });
  }

  async uploadObject(input: UploadObjectInput): Promise<UploadObjectResult> {
    const key = this.sanitizeKey(input.key);
    const bucket = this.storage.bucket(this.config.bucket);
    const file = bucket.file(key);

    await file.save(input.body, {
      resumable: false,
      contentType: input.contentType,
      metadata: {
        ...(input.cacheControl ? { cacheControl: input.cacheControl } : {}),
        metadata: input.metadata,
      },
    });

    if (this.config.gcsMakePublic) {
      await file.makePublic().catch(() => undefined);
    }

    const fallbackBase = `https://storage.googleapis.com/${encodeURIComponent(this.config.bucket)}`;
    const publicBase = this.config.publicBaseUrl || fallbackBase;

    return {
      provider: 'gcs',
      bucket: this.config.bucket,
      key,
      url: `${publicBase.replace(/\/$/, '')}/${this.toUrlPath(key)}`,
      contentType: input.contentType,
      bytes: input.body.length,
    };
  }

  private sanitizeKey(key: string) {
    const normalized = key
      .split('/')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0 && segment !== '.' && segment !== '..')
      .join('/');

    if (!normalized) {
      throw new Error('Invalid storage key');
    }

    return normalized;
  }

  private toUrlPath(key: string) {
    return key
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join('/');
  }
}

