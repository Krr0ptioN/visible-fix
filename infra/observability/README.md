# Local Observability Stack

This stack provides local metrics, logs, and traces with Grafana:

- Prometheus: metrics (`http://localhost:9090`)
- Loki: logs (`http://localhost:3100`)
- Tempo: traces (`http://localhost:3200`)
- Grafana: dashboards (`http://localhost:3002`, admin/admin)
- OpenTelemetry Collector: OTLP ingest (`http://localhost:4318`)

## Run

```bash
docker compose -f infra/observability/docker-compose.yml up -d
```

## Stop

```bash
docker compose -f infra/observability/docker-compose.yml down
```

## API env (local)

```env
LOG_TO_LOKI=true
LOKI_HOST=http://localhost:3100
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
```

## Google Observability path

For managed traces in Google Cloud, use `infra/observability/otel-collector/config.gcp.yaml` with valid ADC/service-account credentials and `GOOGLE_CLOUD_PROJECT`.
