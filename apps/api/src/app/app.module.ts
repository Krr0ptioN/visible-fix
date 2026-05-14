import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validateApiEnv } from '@visiblefix/shared/config';
import { createPinoHttpOptions } from './app.logging';
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
  return LoggerModule.forRoot({
    pinoHttp: createPinoHttpOptions(config),
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
