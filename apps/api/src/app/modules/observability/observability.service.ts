import { Inject, Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const OBSERVABILITY_CONFIG = Symbol('OBSERVABILITY_CONFIG');

export type ObservabilityConfig = {
  appName: string;
  appEnv: string;
};

@Injectable()
export class ObservabilityService {
  private readonly registry = new Registry();

  private readonly httpRequestTotal = new Counter({
    name: 'visiblefix_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.registry],
  });

  private readonly httpRequestDurationMs = new Histogram({
    name: 'visiblefix_http_request_duration_ms',
    help: 'HTTP request duration in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000],
    registers: [this.registry],
  });

  private readonly processInfo = new Gauge({
    name: 'visiblefix_process_info',
    help: 'Static process info labels for service discovery in Prometheus',
    labelNames: ['app', 'env'],
    registers: [this.registry],
  });

  constructor(@Inject(OBSERVABILITY_CONFIG) private readonly config: ObservabilityConfig) {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'visiblefix_',
    });

    this.processInfo.set({ app: this.config.appName, env: this.config.appEnv }, 1);
  }

  recordHttpRequest(params: { method: string; route: string; statusCode: number; durationMs: number }) {
    const labels = {
      method: params.method,
      route: this.normalizeRoute(params.route),
      status_code: String(params.statusCode),
    };

    this.httpRequestTotal.inc(labels);
    this.httpRequestDurationMs.observe(labels, params.durationMs);
  }

  async getMetrics() {
    return this.registry.metrics();
  }

  getContentType() {
    return this.registry.contentType;
  }

  private normalizeRoute(route: string) {
    if (!route) return 'unknown';
    return route
      .replace(/[0-9a-f]{8}-[0-9a-f-]{27}/gi, ':uuid')
      .replace(/\/\d+/g, '/:id');
  }
}
