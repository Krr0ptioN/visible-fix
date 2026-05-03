import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ObservabilityController } from './observability.controller';
import { ObservabilityMiddleware } from './observability.middleware';
import { OBSERVABILITY_CONFIG, ObservabilityService, type ObservabilityConfig } from './observability.service';

export class ObservabilityModule implements NestModule {
  static register(config: ObservabilityConfig): DynamicModule {
    return {
      module: ObservabilityModule,
      controllers: [ObservabilityController],
      providers: [
        ObservabilityService,
        {
          provide: OBSERVABILITY_CONFIG,
          useValue: config,
        },
      ],
      exports: [ObservabilityService],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}
