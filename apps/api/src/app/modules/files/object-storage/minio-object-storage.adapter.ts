import { URL } from 'node:url';
import { Inject, Injectable } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { OBJECT_STORAGE_CONFIG, type ObjectStorageConfig } from './object-storage.config';
import type { ObjectStoragePort, UploadObjectInput, UploadObjectResult } from './object-storage.port';

@Injectable()
export class MinioObjectStorageAdapter implements ObjectStoragePort {
  private readonly client: MinioClient;
  private ensureBucketPromise: Promise<void> | null = null;

  constructor(@Inject(OBJECT_STORAGE_CONFIG) private readonly config: ObjectStorageConfig) {
    const endpointUrl = new URL(this.config.endpoint);
    const isTls = endpointUrl.protocol === 'https:';
    const port = endpointUrl.port ? Number(endpointUrl.port) : isTls ? 443 : 80;

    this.client = new MinioClient({
      endPoint: endpointUrl.hostname,
      port,
      useSSL: isTls,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey,
      pathStyle: true,
      region: this.config.region,
    });
  }

  async uploadObject(input: UploadObjectInput): Promise<UploadObjectResult> {
    await this.ensureBucket();
    const key = this.sanitizeKey(input.key);

    await this.client.putObject(this.config.bucket, key, input.body, input.body.length, {
      'Content-Type': input.contentType,
      ...(input.cacheControl ? { 'Cache-Control': input.cacheControl } : {}),
      ...input.metadata,
    });

    const fallbackBase = `${this.config.endpoint.replace(/\/$/, '')}/${encodeURIComponent(this.config.bucket)}`;
    const publicBase = this.config.publicBaseUrl || fallbackBase;

    return {
      provider: 'minio',
      bucket: this.config.bucket,
      key,
      url: `${publicBase.replace(/\/$/, '')}/${this.toUrlPath(key)}`,
      contentType: input.contentType,
      bytes: input.body.length,
    };
  }

  private ensureBucket() {
    if (this.ensureBucketPromise) return this.ensureBucketPromise;

    this.ensureBucketPromise = (async () => {
      const exists = await this.client.bucketExists(this.config.bucket);
      if (!exists) {
        await this.client.makeBucket(this.config.bucket, this.config.region);
      }
    })();

    return this.ensureBucketPromise;
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

