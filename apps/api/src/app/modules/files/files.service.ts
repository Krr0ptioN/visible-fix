import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { OBJECT_STORAGE_CONFIG, OBJECT_STORAGE_PORT, type ObjectStorageConfig } from './object-storage/object-storage.config';
import type { ObjectStoragePort } from './object-storage/object-storage.port';

type EvidenceUploadFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly allowedMimePrefix = 'image/';

  constructor(
    @Inject(OBJECT_STORAGE_PORT) private readonly objectStorage: ObjectStoragePort,
    @Inject(OBJECT_STORAGE_CONFIG) private readonly config: ObjectStorageConfig
  ) {}

  async uploadEvidence(file: EvidenceUploadFile | undefined) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.buffer?.length) {
      throw new BadRequestException('Uploaded file is empty');
    }

    if (!file.mimetype?.startsWith(this.allowedMimePrefix)) {
      throw new BadRequestException('Only image uploads are supported');
    }

    if (file.size > this.config.maxFileSizeBytes) {
      throw new BadRequestException(`File size exceeds limit of ${this.config.maxFileSizeBytes} bytes`);
    }

    const key = this.buildObjectKey(file);

    const uploaded = await this.objectStorage.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000, immutable',
      metadata: {
        originalName: file.originalname,
      },
    });

    this.logger.log(`Uploaded evidence file to ${uploaded.provider} (${uploaded.key})`);

    return {
      success: true,
      data: uploaded,
    };
  }

  private buildObjectKey(file: EvidenceUploadFile) {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const extension = this.resolveExtension(file);

    return `evidence/${year}/${month}/${day}/${Date.now()}-${randomUUID()}.${extension}`;
  }

  private resolveExtension(file: EvidenceUploadFile) {
    const fromName = extname(file.originalname || '').replace('.', '').toLowerCase();
    if (fromName) return fromName;

    if (file.mimetype === 'image/jpeg') return 'jpg';
    if (file.mimetype === 'image/png') return 'png';
    if (file.mimetype === 'image/webp') return 'webp';
    if (file.mimetype === 'image/gif') return 'gif';

    return 'bin';
  }
}
