import { Module } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_CONFIG, envFilePath, type ApplicationBootstrapOptions } from './app.config';
import { DatabaseModule } from './common/database/database.module';
import { AccessModule } from './modules/access/access.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IssuesModule } from './modules/issues/issues.module';
import { AdminModule } from './modules/admin/admin.module';
import { FilesModule } from './modules/files/files.module';
import { ObservabilityModule } from './modules/observability/observability.module';

const appName = process.env.APP_NAME ?? 'visiblefix-api';
const appEnv = process.env.NODE_ENV ?? 'development';
const logLevel = process.env.LOG_LEVEL ?? (appEnv === 'production' ? 'info' : 'debug');
const logToLoki = (process.env.LOG_TO_LOKI ?? 'false').toLowerCase() === 'true';
const lokiHost = process.env.LOKI_HOST ?? 'http://localhost:3100';
const prettyLogs = appEnv !== 'production' && process.env.LOG_PRETTY !== 'false';

const transportTargets: Array<{ target: string; options?: Record<string, unknown> }> = [];

if (prettyLogs) {
  transportTargets.push({
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  });
}

if (logToLoki) {
  transportTargets.push({
    target: 'pino-loki',
    options: {
      host: lokiHost,
      labels: {
        app: appName,
        env: appEnv,
      },
      batching: true,
      interval: 5,
      timeout: 10_000,
    },
  });
}

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        name: appName,
        level: logLevel,
        quietReqLogger: false,
        customProps: () => ({
          app: appName,
          env: appEnv,
        }),
        genReqId: (req, res) => {
          const fromHeader = req.headers['x-request-id'];
          const requestId = Array.isArray(fromHeader) ? fromHeader[0] : fromHeader;
          const resolved = requestId || randomUUID();
          res.setHeader('x-request-id', resolved);
          return resolved;
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["set-cookie"]',
            'req.body.password',
            'req.body.accessToken',
            'req.body.refreshToken',
          ],
          censor: '[REDACTED]',
        },
        ...(transportTargets.length > 0 ? { transport: { targets: transportTargets } } : {}),
      },
    }),
    DatabaseModule,
    AccessModule,
    UsersModule,
    AuthModule,
    IssuesModule,
    AdminModule,
    FilesModule,
    ObservabilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
