import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import type { ApplicationBootstrapOptions } from './app/app.config';

let sdk: NodeSDK | null = null;
let telemetryInitialized = false;

export async function initializeTelemetry(config: ApplicationBootstrapOptions['telemetry']) {
  if (telemetryInitialized) {
    return;
  }

  telemetryInitialized = true;

  if (config.disabled) {
    return;
  }

  if (config.logLevel !== 'none') {
    diag.setLogger(new DiagConsoleLogger(), {
      debug: DiagLogLevel.DEBUG,
      info: DiagLogLevel.INFO,
      warn: DiagLogLevel.WARN,
      error: DiagLogLevel.ERROR,
    }[config.logLevel] ?? DiagLogLevel.INFO);
  }

  const traceExporter = new OTLPTraceExporter({
    url: config.tracesEndpoint,
  });

  sdk = new NodeSDK({
    serviceName: config.serviceName,
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
