import { DynamicModule } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { GcsObjectStorageAdapter } from './object-storage/gcs-object-storage.adapter';
import { LocalObjectStorageAdapter } from './object-storage/local-object-storage.adapter';
import { MinioObjectStorageAdapter } from './object-storage/minio-object-storage.adapter';
import { OBJECT_STORAGE_CONFIG, OBJECT_STORAGE_PORT, type ObjectStorageConfig } from './object-storage/object-storage.config';

export class FilesModule {
  static register(config: ObjectStorageConfig): DynamicModule {
    return {
      module: FilesModule,
      controllers: [FilesController],
      providers: [
        FilesService,
        LocalObjectStorageAdapter,
        MinioObjectStorageAdapter,
        GcsObjectStorageAdapter,
        {
          provide: OBJECT_STORAGE_CONFIG,
          useValue: config,
        },
        {
          provide: OBJECT_STORAGE_PORT,
          inject: [OBJECT_STORAGE_CONFIG, LocalObjectStorageAdapter, MinioObjectStorageAdapter, GcsObjectStorageAdapter],
          useFactory: (
            storageConfig: ObjectStorageConfig,
            localAdapter: LocalObjectStorageAdapter,
            minioAdapter: MinioObjectStorageAdapter,
            gcsAdapter: GcsObjectStorageAdapter
          ) => {
            if (storageConfig.provider === 'minio') return minioAdapter;
            if (storageConfig.provider === 'gcs') return gcsAdapter;
            return localAdapter;
          },
        },
      ],
      exports: [FilesService, OBJECT_STORAGE_PORT],
    };
  }
}
