import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { GcsObjectStorageAdapter } from './object-storage/gcs-object-storage.adapter';
import { LocalObjectStorageAdapter } from './object-storage/local-object-storage.adapter';
import { MinioObjectStorageAdapter } from './object-storage/minio-object-storage.adapter';
import { getObjectStorageConfig, OBJECT_STORAGE_CONFIG, OBJECT_STORAGE_PORT } from './object-storage/object-storage.config';

@Module({
  controllers: [FilesController],
  providers: [
    FilesService,
    LocalObjectStorageAdapter,
    MinioObjectStorageAdapter,
    GcsObjectStorageAdapter,
    {
      provide: OBJECT_STORAGE_CONFIG,
      useFactory: getObjectStorageConfig,
    },
    {
      provide: OBJECT_STORAGE_PORT,
      inject: [OBJECT_STORAGE_CONFIG, LocalObjectStorageAdapter, MinioObjectStorageAdapter, GcsObjectStorageAdapter],
      useFactory: (
        config: ReturnType<typeof getObjectStorageConfig>,
        localAdapter: LocalObjectStorageAdapter,
        minioAdapter: MinioObjectStorageAdapter,
        gcsAdapter: GcsObjectStorageAdapter
      ) => {
        if (config.provider === 'minio') return minioAdapter;
        if (config.provider === 'gcs') return gcsAdapter;
        return localAdapter;
      },
    },
  ],
  exports: [FilesService, OBJECT_STORAGE_PORT],
})
export class FilesModule {}

