import { createPinoHttpOptions } from '../src/app/app.module';
import type { ApplicationBootstrapOptions } from '../src/app/app.config';

const baseConfig: ApplicationBootstrapOptions = {
  port: 3000,
  globalPrefix: 'api/v1',
  appName: 'visiblefix-api',
  appEnv: 'production',
  databaseUrl: 'postgres://postgres:postgres@localhost:5432/visiblefix',
  auth: {
    jwtAccessSecret: 'access',
    jwtRefreshSecret: 'refresh',
    jwtAccessTtl: 900,
    jwtRefreshTtl: 2592000,
    adminName: 'VisibleFix Admin',
  },
  objectStorage: {
    provider: 'local',
    bucket: 'visiblefix-dev',
    publicBaseUrl: 'http://localhost:3000/uploads',
    maxFileSizeBytes: 1024,
    localRootDir: 'storage',
    endpoint: 'http://localhost:9000',
    region: 'us-east-1',
    accessKey: '',
    secretKey: '',
    gcsMakePublic: true,
  },
  logging: {
    level: 'info',
    pretty: false,
    toLoki: false,
    lokiHost: 'http://localhost:3100',
    googleCloud: true,
  },
  telemetry: {
    disabled: true,
    logLevel: 'none',
    serviceName: 'visiblefix-api',
    tracesEndpoint: 'http://localhost:4318/v1/traces',
  },
};

describe('createPinoHttpOptions', () => {
  it('uses Google Cloud structured logging fields without transports in cloud mode', () => {
    const options = createPinoHttpOptions(baseConfig);
    const level = options.formatters?.level?.('error', 50);

    expect(options.messageKey).toBe('message');
    expect(options.transport).toBeUndefined();
    expect(level).toEqual({ level: 50, severity: 'ERROR', 'logging.googleapis.com/severity': 'ERROR' });
  });
});
