/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'node:fs';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app/app.module';
import appConfig from './app/app.config';
import { initializeTelemetry, shutdownTelemetry } from './telemetry';

async function bootstrap() {
  const config = appConfig();
  await initializeTelemetry(config.telemetry);

  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(config), { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  const logger = app.get(Logger);
  app.setGlobalPrefix(config.globalPrefix);

  if (config.objectStorage.provider === 'local') {
    mkdirSync(config.objectStorage.localRootDir, { recursive: true });
    app.useStaticAssets(config.objectStorage.localRootDir, { prefix: '/uploads/' });
    logger.log(`Local object storage served at /uploads (${config.objectStorage.localRootDir})`);
  }

  await app.listen(config.port);
  logger.log(`Application is running on: http://localhost:${config.port}/${config.globalPrefix}`);

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
