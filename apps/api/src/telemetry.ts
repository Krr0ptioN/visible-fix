import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';

let sdk: NodeSDK | null = null;
let telemetryInitialized = false;

export async function initializeTelemetry() {
  if (telemetryInitialized) {
    return;
  }

  telemetryInitialized = true;

  if ((process.env.OTEL_SDK_DISABLED ?? 'false').toLowerCase() === 'true') {
    return;
  }

  if ((process.env.OTEL_LOG_LEVEL ?? 'none').toLowerCase() !== 'none') {
    const level = (process.env.OTEL_LOG_LEVEL ?? 'info').toLowerCase();
    diag.setLogger(new DiagConsoleLogger(), {
      debug: DiagLogLevel.DEBUG,
      info: DiagLogLevel.INFO,
      warn: DiagLogLevel.WARN,
      error: DiagLogLevel.ERROR,
    }[level] ?? DiagLogLevel.INFO);
  }

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
  });

  sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'visiblefix-api',
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  });

  await sdk.start();
}

export async function shutdownTelemetry() {
  if (!sdk) return;
  await sdk.shutdown().catch(() => undefined);
  sdk = null;
  telemetryInitialized = false;
}

