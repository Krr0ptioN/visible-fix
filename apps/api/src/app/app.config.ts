import { isAbsolute, join } from 'node:path';
import { config as loadEnvFile } from 'dotenv';
import { CONFIG_APP, validateApiEnv } from '@visiblefix/shared/config';
import type { ObjectStorageConfig } from './modules/files/object-storage/object-storage.config';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

export const APP_CONFIG = Symbol('APP_CONFIG');

export type ApplicationBootstrapOptions = {
  port: number;
  globalPrefix: string;
  appName: string;
  appEnv: string;
  databaseUrl: string;
  auth: {
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
    jwtAccessTtl: string | number;
    jwtRefreshTtl: string | number;
    adminEmail?: string;
    adminPassword?: string;
    adminName: string;
  };
  objectStorage: ObjectStorageConfig;
  logging: {
    level: LogLevel;
    pretty: boolean;
    toLoki: boolean;
    lokiHost: string;
    googleCloud: boolean;
    googleCloudProjectId?: string;
  };
  telemetry: {
    disabled: boolean;
    logLevel: 'none' | 'debug' | 'info' | 'warn' | 'error';
    serviceName: string;
    tracesEndpoint: string;
  };
};

export const envFilePath = ['.env', '.env.local'];

export function loadApiEnvFiles() {
  for (const path of envFilePath) {
    loadEnvFile({ path, override: false, quiet: true });
  }
}

loadApiEnvFiles();

const ttl = (seconds: number | undefined, duration: string | undefined, fallbackSeconds: number) => seconds ?? duration ?? fallbackSeconds;

export default function appConfig(env: NodeJS.ProcessEnv = process.env): ApplicationBootstrapOptions {
  let parsed: any;
  try {
    parsed = validateApiEnv(env);
  } catch (err) {
    if (env.NODE_ENV === 'test' || process.env.NODE_ENV === 'test') {
      // In tests, we allow missing env vars if they are not explicitly provided
      // validateApiEnv will throw if required vars are missing.
      // We can fallback to a partially valid object for unit tests that don't need the full config.
      parsed = {};
    } else {
      throw err;
    }
  }

  const port = parsed[CONFIG_APP.API_PORT] ?? 8030;
  const appName = parsed[CONFIG_APP.APP_NAME] ?? 'visiblefix-api';
  const appEnv = parsed[CONFIG_APP.NODE_ENV] ?? 'development';
  const googleCloudProjectId = env.GOOGLE_CLOUD_PROJECT || env.GCP_PROJECT_ID;
  const googleCloud =
    parsed[CONFIG_APP.LOG_GOOGLE_CLOUD] ??
    Boolean(googleCloudProjectId || env.K_SERVICE || env.GCE_METADATA_HOST);
  const publicBaseUrl = parsed[CONFIG_APP.OBJECT_STORAGE_PUBLIC_BASE_URL] ?? `http://localhost:${port}/uploads`;
  const localRoot = parsed[CONFIG_APP.LOCAL_OBJECT_STORAGE_ROOT] ?? 'storage';

  return {
    port,
    globalPrefix: 'api/v1',
    appName,
    appEnv,
    databaseUrl: parsed[CONFIG_APP.DATABASE_URL] ?? '',
    auth: {
      jwtAccessSecret: parsed[CONFIG_APP.JWT_ACCESS_SECRET] ?? '',
      jwtRefreshSecret: parsed[CONFIG_APP.JWT_REFRESH_SECRET] ?? '',
      jwtAccessTtl: ttl(parsed[CONFIG_APP.JWT_ACCESS_TTL_SECONDS], parsed[CONFIG_APP.JWT_ACCESS_TTL], 60 * 15),
      jwtRefreshTtl: ttl(parsed[CONFIG_APP.JWT_REFRESH_TTL_SECONDS], parsed[CONFIG_APP.JWT_REFRESH_TTL], 60 * 60 * 24 * 30),
      adminEmail: parsed[CONFIG_APP.ADMIN_EMAIL],
      adminPassword: parsed[CONFIG_APP.ADMIN_PASSWORD],
      adminName: parsed[CONFIG_APP.ADMIN_NAME] ?? 'VisibleFix Admin',
    },
    objectStorage: {
      provider: parsed[CONFIG_APP.OBJECT_STORAGE_PROVIDER] ?? 'local',
      bucket: parsed[CONFIG_APP.OBJECT_STORAGE_BUCKET] ?? 'visiblefix-dev',
      publicBaseUrl,
      maxFileSizeBytes: parsed[CONFIG_APP.OBJECT_STORAGE_MAX_FILE_SIZE_BYTES] ?? 10 * 1024 * 1024,
      localRootDir: isAbsolute(localRoot) ? localRoot : join(process.cwd(), localRoot),
      endpoint: parsed[CONFIG_APP.OBJECT_STORAGE_ENDPOINT] ?? 'http://localhost:9000',
      region: parsed[CONFIG_APP.OBJECT_STORAGE_REGION] ?? 'us-east-1',
      accessKey: parsed[CONFIG_APP.OBJECT_STORAGE_ACCESS_KEY] ?? '',
      secretKey: parsed[CONFIG_APP.OBJECT_STORAGE_SECRET_KEY] ?? '',
      gcsProjectId: parsed[CONFIG_APP.GCS_PROJECT_ID],
      gcsKeyFilename: parsed[CONFIG_APP.GCS_KEY_FILENAME],
      gcsMakePublic: parsed[CONFIG_APP.GCS_MAKE_PUBLIC] ?? true,
    },
    logging: {
      level: parsed[CONFIG_APP.LOG_LEVEL] ?? (appEnv === 'production' ? 'info' : 'debug'),
      pretty: googleCloud ? false : parsed[CONFIG_APP.LOG_PRETTY] ?? appEnv !== 'production',
      toLoki: googleCloud ? false : parsed[CONFIG_APP.LOG_TO_LOKI] ?? false,
      lokiHost: parsed[CONFIG_APP.LOKI_HOST] ?? 'http://localhost:3100',
      googleCloud,
      googleCloudProjectId,
    },
    telemetry: {
      disabled: parsed[CONFIG_APP.OTEL_SDK_DISABLED] ?? false,
      logLevel: parsed[CONFIG_APP.OTEL_LOG_LEVEL] ?? 'none',
      serviceName: parsed[CONFIG_APP.OTEL_SERVICE_NAME] ?? appName,
      tracesEndpoint:
        parsed[CONFIG_APP.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT] ??
        `${(parsed[CONFIG_APP.OTEL_EXPORTER_OTLP_ENDPOINT] ?? 'http://localhost:4318').replace(/\/$/, '')}/v1/traces`,
    },
  };
}
