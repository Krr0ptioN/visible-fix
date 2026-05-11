import { z } from 'zod';

export enum CONFIG_APP {
  API_PORT = 'API_PORT',
  APP_NAME = 'APP_NAME',
  NODE_ENV = 'NODE_ENV',

  DATABASE_URL = 'DATABASE_URL',

  JWT_ACCESS_SECRET = 'JWT_ACCESS_SECRET',
  JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET',
  JWT_ACCESS_TTL = 'JWT_ACCESS_TTL',
  JWT_ACCESS_TTL_SECONDS = 'JWT_ACCESS_TTL_SECONDS',
  JWT_REFRESH_TTL = 'JWT_REFRESH_TTL',
  JWT_REFRESH_TTL_SECONDS = 'JWT_REFRESH_TTL_SECONDS',

  ADMIN_EMAIL = 'ADMIN_EMAIL',
  ADMIN_PASSWORD = 'ADMIN_PASSWORD',
  ADMIN_NAME = 'ADMIN_NAME',

  OBJECT_STORAGE_PROVIDER = 'OBJECT_STORAGE_PROVIDER',
  OBJECT_STORAGE_BUCKET = 'OBJECT_STORAGE_BUCKET',
  OBJECT_STORAGE_PUBLIC_BASE_URL = 'OBJECT_STORAGE_PUBLIC_BASE_URL',
  OBJECT_STORAGE_MAX_FILE_SIZE_BYTES = 'OBJECT_STORAGE_MAX_FILE_SIZE_BYTES',
  LOCAL_OBJECT_STORAGE_ROOT = 'LOCAL_OBJECT_STORAGE_ROOT',
  OBJECT_STORAGE_ENDPOINT = 'OBJECT_STORAGE_ENDPOINT',
  OBJECT_STORAGE_REGION = 'OBJECT_STORAGE_REGION',
  OBJECT_STORAGE_ACCESS_KEY = 'OBJECT_STORAGE_ACCESS_KEY',
  OBJECT_STORAGE_SECRET_KEY = 'OBJECT_STORAGE_SECRET_KEY',
  GCS_PROJECT_ID = 'GCS_PROJECT_ID',
  GCS_KEY_FILENAME = 'GCS_KEY_FILENAME',
  GCS_MAKE_PUBLIC = 'GCS_MAKE_PUBLIC',

  LOG_LEVEL = 'LOG_LEVEL',
  LOG_PRETTY = 'LOG_PRETTY',
  LOG_TO_LOKI = 'LOG_TO_LOKI',
  LOG_GOOGLE_CLOUD = 'LOG_GOOGLE_CLOUD',
  LOKI_HOST = 'LOKI_HOST',

  OTEL_SERVICE_NAME = 'OTEL_SERVICE_NAME',
  OTEL_SDK_DISABLED = 'OTEL_SDK_DISABLED',
  OTEL_LOG_LEVEL = 'OTEL_LOG_LEVEL',
  OTEL_EXPORTER_OTLP_ENDPOINT = 'OTEL_EXPORTER_OTLP_ENDPOINT',
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
}

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const requiredString = z.preprocess(emptyToUndefined, z.string().min(1));
const booleanFromEnv = z.preprocess((value) => {
  if (value === '') return undefined;
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return value;
}, z.boolean());

const optionalBoolean = booleanFromEnv.optional();
const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().optional());

export const apiEnvSchema = z
  .object({
    [CONFIG_APP.API_PORT]: z.coerce.number().int().positive().default(8030),
    [CONFIG_APP.APP_NAME]: z.string().default('visiblefix-api'),
    [CONFIG_APP.NODE_ENV]: z.string().default('development'),

    [CONFIG_APP.DATABASE_URL]: requiredString,

    [CONFIG_APP.JWT_ACCESS_SECRET]: requiredString,
    [CONFIG_APP.JWT_REFRESH_SECRET]: requiredString,
    [CONFIG_APP.JWT_ACCESS_TTL]: optionalString,
    [CONFIG_APP.JWT_ACCESS_TTL_SECONDS]: optionalNumber,
    [CONFIG_APP.JWT_REFRESH_TTL]: optionalString,
    [CONFIG_APP.JWT_REFRESH_TTL_SECONDS]: optionalNumber,

    [CONFIG_APP.ADMIN_EMAIL]: optionalString,
    [CONFIG_APP.ADMIN_PASSWORD]: optionalString,
    [CONFIG_APP.ADMIN_NAME]: z.string().default('VisibleFix Admin'),

    [CONFIG_APP.OBJECT_STORAGE_PROVIDER]: z.enum(['local', 'minio', 'gcs']).default('local'),
    [CONFIG_APP.OBJECT_STORAGE_BUCKET]: z.string().default('visiblefix-dev'),
    [CONFIG_APP.OBJECT_STORAGE_PUBLIC_BASE_URL]: optionalString,
    [CONFIG_APP.OBJECT_STORAGE_MAX_FILE_SIZE_BYTES]: z.coerce.number().int().positive().default(10 * 1024 * 1024),
    [CONFIG_APP.LOCAL_OBJECT_STORAGE_ROOT]: z.string().default('storage'),
    [CONFIG_APP.OBJECT_STORAGE_ENDPOINT]: optionalString,
    [CONFIG_APP.OBJECT_STORAGE_REGION]: z.string().default('us-east-1'),
    [CONFIG_APP.OBJECT_STORAGE_ACCESS_KEY]: optionalString,
    [CONFIG_APP.OBJECT_STORAGE_SECRET_KEY]: optionalString,
    [CONFIG_APP.GCS_PROJECT_ID]: optionalString,
    [CONFIG_APP.GCS_KEY_FILENAME]: optionalString,
    [CONFIG_APP.GCS_MAKE_PUBLIC]: optionalBoolean.default(true),

    [CONFIG_APP.LOG_LEVEL]: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
    [CONFIG_APP.LOG_PRETTY]: optionalBoolean,
    [CONFIG_APP.LOG_TO_LOKI]: optionalBoolean.default(false),
    [CONFIG_APP.LOG_GOOGLE_CLOUD]: optionalBoolean,
    [CONFIG_APP.LOKI_HOST]: z.string().url().default('http://localhost:3100'),

    [CONFIG_APP.OTEL_SERVICE_NAME]: optionalString,
    [CONFIG_APP.OTEL_SDK_DISABLED]: optionalBoolean.default(false),
    [CONFIG_APP.OTEL_LOG_LEVEL]: z.enum(['none', 'debug', 'info', 'warn', 'error']).default('none'),
    [CONFIG_APP.OTEL_EXPORTER_OTLP_ENDPOINT]: z.string().url().default('http://localhost:4318'),
    [CONFIG_APP.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT]: optionalString,
  })
  .superRefine((env, ctx) => {
    const adminEmail = env[CONFIG_APP.ADMIN_EMAIL];
    const adminPassword = env[CONFIG_APP.ADMIN_PASSWORD];

    if ((adminEmail && !adminPassword) || (!adminEmail && adminPassword)) {
      ctx.addIssue({
        code: 'custom',
        message: 'ADMIN_EMAIL and ADMIN_PASSWORD must be configured together.',
        path: [adminEmail ? CONFIG_APP.ADMIN_PASSWORD : CONFIG_APP.ADMIN_EMAIL],
      });
    }

    if (env[CONFIG_APP.OBJECT_STORAGE_PROVIDER] === 'minio') {
      for (const key of [
        CONFIG_APP.OBJECT_STORAGE_ENDPOINT,
        CONFIG_APP.OBJECT_STORAGE_ACCESS_KEY,
        CONFIG_APP.OBJECT_STORAGE_SECRET_KEY,
      ]) {
        if (!env[key]) {
          ctx.addIssue({ code: 'custom', message: `${key} is required when OBJECT_STORAGE_PROVIDER=minio.`, path: [key] });
        }
      }
    }

    if (env[CONFIG_APP.OBJECT_STORAGE_PROVIDER] === 'gcs') {
      for (const key of [CONFIG_APP.GCS_PROJECT_ID, CONFIG_APP.GCS_KEY_FILENAME]) {
        if (!env[key]) {
          ctx.addIssue({ code: 'custom', message: `${key} is required when OBJECT_STORAGE_PROVIDER=gcs.`, path: [key] });
        }
      }
    }
  });

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const validateApiEnv = (env: Record<string, unknown>) => apiEnvSchema.parse(env);
