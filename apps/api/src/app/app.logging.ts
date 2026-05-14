import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { ApplicationBootstrapOptions } from './app.config';

const googleSeverityByPinoLevel: Record<string, string> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

const severityFields = (label: string, number: number) => {
  const severity = googleSeverityByPinoLevel[label] ?? label.toUpperCase();

  return {
    level: number,
    severity,
    'logging.googleapis.com/severity': severity,
  };
};

const cloudTrace = (req: IncomingMessage, projectId?: string) => {
  if (!projectId) return undefined;

  const header = req.headers['x-cloud-trace-context'];
  const value = Array.isArray(header) ? header[0] : header;
  const traceId = value?.split('/')[0];

  return traceId ? `projects/${projectId}/traces/${traceId}` : undefined;
};

const httpRequest = (req: IncomingMessage, res: ServerResponse) => ({
  requestMethod: req.method,
  requestUrl: req.url,
  status: res.statusCode,
  userAgent: req.headers['user-agent'],
  remoteIp: req.socket.remoteAddress,
});

export const createPinoHttpOptions = (config: ApplicationBootstrapOptions) => {
  const transportTargets: Array<{ target: string; options?: Record<string, unknown> }> = [];

  if (!config.logging.googleCloud && config.logging.pretty) {
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

  if (!config.logging.googleCloud && config.logging.toLoki) {
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

  const formatters = {
    bindings: () => ({
      app: config.appName,
      env: config.appEnv,
    }),
    ...(transportTargets.length === 0 ? { level: severityFields } : {}),
  };

  return {
    name: config.appName,
    level: config.logging.level,
    messageKey: 'message',
    timestamp: config.logging.googleCloud ? () => `,"time":"${new Date().toISOString()}"` : undefined,
    formatters,
    quietReqLogger: false,
    customProps: (req: IncomingMessage) => {
      const trace = cloudTrace(req, config.logging.googleCloudProjectId);

      return {
        app: config.appName,
        env: config.appEnv,
        ...(trace ? { trace, 'logging.googleapis.com/trace': trace } : {}),
      };
    },
    customSuccessObject: (req: IncomingMessage, res: ServerResponse, val: Record<string, unknown>) => ({
      ...val,
      httpRequest: httpRequest(req, res),
      'logging.googleapis.com/httpRequest': httpRequest(req, res),
    }),
    customErrorObject: (req: IncomingMessage, res: ServerResponse, error: Error, val: Record<string, unknown>) => ({
      ...val,
      error,
      httpRequest: httpRequest(req, res),
      'logging.googleapis.com/httpRequest': httpRequest(req, res),
    }),
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
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
  };
};
