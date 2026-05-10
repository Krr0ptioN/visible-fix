import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ObservabilityService } from './observability.service';

@Injectable()
export class ObservabilityMiddleware implements NestMiddleware {
  constructor(private readonly observabilityService: ObservabilityService) {}

  use(request: Request, response: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    response.on('finish', () => {
      const elapsedNs = process.hrtime.bigint() - start;
      const durationMs = Number(elapsedNs) / 1_000_000;
      const route = this.resolveRoute(request);

      this.observabilityService.recordHttpRequest({
        method: request.method,
        route,
        statusCode: response.statusCode,
        durationMs,
      });
    });

    next();
  }

  private resolveRoute(request: Request) {
    const routePath = request.route?.path;
    if (typeof routePath === 'string') return routePath;
    if (typeof request.path === 'string' && request.path.length > 0) return request.path;
    return request.originalUrl || request.url || 'unknown';
  }
}

