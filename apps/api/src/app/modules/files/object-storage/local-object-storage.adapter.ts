import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Inject, Injectable } from '@nestjs/common';
import { OBJECT_STORAGE_CONFIG, type ObjectStorageConfig } from './object-storage.config';
import type { ObjectStoragePort, UploadObjectInput, UploadObjectResult } from './object-storage.port';

@Injectable()
export class LocalObjectStorageAdapter implements ObjectStoragePort {
  constructor(@Inject(OBJECT_STORAGE_CONFIG) private readonly config: ObjectStorageConfig) {}

  async uploadObject(input: UploadObjectInput): Promise<UploadObjectResult> {
    const key = this.sanitizeKey(input.key);
    const targetPath = join(this.config.localRootDir, key);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, input.body);

    return {
      provider: 'local',
      bucket: this.config.bucket,
      key,
      url: `${this.config.publicBaseUrl.replace(/\/$/, '')}/${this.toUrlPath(key)}`,
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

