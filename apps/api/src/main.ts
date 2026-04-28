/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app/app.module';
import { initializeTelemetry, shutdownTelemetry } from './telemetry';

async function bootstrap() {
  await initializeTelemetry();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  const logger = app.get(Logger);
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  const objectStorageProvider = (process.env.OBJECT_STORAGE_PROVIDER ?? 'local').toLowerCase();
  if (objectStorageProvider === 'local') {
    const configuredRoot = process.env.LOCAL_OBJECT_STORAGE_ROOT ?? 'storage';
    const localStorageRoot = isAbsolute(configuredRoot) ? configuredRoot : join(process.cwd(), configuredRoot);
    mkdirSync(localStorageRoot, { recursive: true });
    app.useStaticAssets(localStorageRoot, { prefix: '/uploads/' });
    logger.log(`Local object storage served at /uploads (${localStorageRoot})`);
  }

  const port = process.env.API_PORT || 8030;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);

  let shuttingDown = false;
  const handleSignal = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    await app.close().catch(() => undefined);
    await shutdownTelemetry();
  };

  process.once('SIGTERM', handleSignal);
  process.once('SIGINT', handleSignal);
}

bootstrap();
