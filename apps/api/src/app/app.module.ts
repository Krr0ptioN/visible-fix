import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import { validateApiEnv } from '@visiblefix/shared/config';
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

const loggerModule = (config: ApplicationBootstrapOptions) => {
  const transportTargets: Array<{ target: string; options?: Record<string, unknown> }> = [];

  if (config.logging.pretty) {
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

  if (config.logging.toLoki) {
    transportTargets.push({
      target: 'pino-loki',
      options: {
        host: config.logging.lokiHost,
        labels: {
          app: config.appName,
          env: config.appEnv,
        },
        batching: true,
        interval: 5,
        timeout: 10_000,
      },
    });
  }

  return LoggerModule.forRoot({
    pinoHttp: {
      name: config.appName,
      level: config.logging.level,
      quietReqLogger: false,
      customProps: () => ({
        app: config.appName,
        env: config.appEnv,
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
  });
};

export class AppModule {
  static register(config: ApplicationBootstrapOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath,
          validate: validateApiEnv,
        }),
        loggerModule(config),
        DatabaseModule,
        AccessModule,
        UsersModule,
        AuthModule.register(config),
        IssuesModule,
        AdminModule,
        FilesModule.register(config.objectStorage),
        ObservabilityModule.register({ appName: config.appName, appEnv: config.appEnv }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: APP_CONFIG,
          useValue: config,
        },
      ],
    };
  }
}
