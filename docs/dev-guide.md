# Development Guide

This guide covers local setup for:

- PostgreSQL (required)
- MinIO object storage (optional, for photo evidence files)
- Observability stack (optional, for metrics/logs/traces)

## 1. Prerequisites

- Node.js 20+
- pnpm
- Docker (or Podman with Compose support)

## 2. Quick Start

Bootstrap local development:

```bash
pnpm setup:dev
```

This script:

- creates/updates `.env`
- starts `postgres` + `pgadmin`
- applies DB schema (`pnpm db:push`)
- seeds local data (`pnpm db:seed:dev`)

Run apps:

```bash
pnpm dev:api
pnpm dev:web
```

Optional mobile:

```bash
pnpm dev:mobile
```

## 3. Local Database

Default local DB URL:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/visiblefix
```

Infra commands:

```bash
pnpm infra:up
pnpm infra:ps
pnpm infra:logs
pnpm infra:down
```

pgAdmin:

- URL: `http://localhost:5050`
- Email: `admin@visiblefix.dev`
- Password: `admin`

## 4. Local Object Storage (MinIO)

Photo evidence uploads are handled by `POST /api/v1/files/evidence`.

Enable MinIO from the existing compose file (profile-based service):

```bash
docker compose -f infra/docker-compose.yml --profile object-storage up -d
```

MinIO endpoints:

- API: `http://localhost:9000`
- Console: `http://localhost:9001`
- Access key: `minioadmin`
- Secret key: `minioadmin`

Set `.env` for MinIO-backed uploads:

```env
OBJECT_STORAGE_PROVIDER=minio
OBJECT_STORAGE_BUCKET=visiblefix-dev
OBJECT_STORAGE_PUBLIC_BASE_URL=http://localhost:9000/visiblefix-dev
OBJECT_STORAGE_ENDPOINT=http://localhost:9000
OBJECT_STORAGE_REGION=us-east-1
OBJECT_STORAGE_ACCESS_KEY=minioadmin
OBJECT_STORAGE_SECRET_KEY=minioadmin
```

Stop MinIO:

```bash
docker compose -f infra/docker-compose.yml --profile object-storage down
```

## 5. Local Observability (Metrics, Logs, Traces)

The project includes a local stack under `infra/observability`:

- Prometheus for metrics
- Loki for logs
- Tempo for traces
- OpenTelemetry Collector for OTLP ingestion
- Grafana for unified dashboards

Start stack:

```bash
docker compose -f infra/observability/docker-compose.yml up -d
```

UI/API endpoints:

- Grafana: `http://localhost:3002` (`admin` / `admin`)
- Prometheus: `http://localhost:9090`
- Loki: `http://localhost:3100`
- Tempo: `http://localhost:3200`
- OTel Collector OTLP HTTP: `http://localhost:4318`

API env for local telemetry:

```env
LOG_TO_LOKI=true
LOKI_HOST=http://localhost:3100
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
```

Stop stack:

```bash
docker compose -f infra/observability/docker-compose.yml down
```

## 6. Google Observability Path (Production)

Recommended production mapping on Google Cloud Run:

- Logs: app stdout/stderr -> Cloud Logging
- Traces: OpenTelemetry -> OTLP collector -> Cloud Trace (or direct Cloud Trace exporter)
- Metrics: Prometheus/OpenTelemetry metrics -> Managed Service for Prometheus / Cloud Monitoring

A collector template for Google exporter is provided at:

- `infra/observability/otel-collector/config.gcp.yaml`

Requirements:

- `GOOGLE_CLOUD_PROJECT` set
- service account with Cloud Trace/Monitoring write permissions

## 7. Web Analytics + Error Monitoring

### 7.1 Google Analytics (GA4)

Set the measurement ID:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

No client-side custom setup is required for baseline page analytics beyond this env var.

### 7.2 Sentry (Next.js)

Sentry is configured in `apps/web` with:

- `withSentryConfig` in `next.config.js`
- runtime config files:
  - `sentry.server.config.ts`
  - `sentry.edge.config.ts`
  - `instrumentation-client.ts`
- App Router global boundary:
  - `src/app/global-error.tsx`

Minimum production vars:

```env
NEXT_PUBLIC_SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
SENTRY_ORG=<sentry-org-slug>
SENTRY_PROJECT=<sentry-project-slug>
SENTRY_AUTH_TOKEN=<sentry-auth-token>
```

Notes:

- `SENTRY_AUTH_TOKEN` is required for source map upload during production builds.
- In pnpm environments with script approval enabled, ensure `@sentry/cli` is approved (`pnpm approve-builds`) in CI/dev images.

## 8. Troubleshooting

- Ports busy: check `5432`, `5050`, `9000`, `9001`, `3002`, `9090`, `3100`, `3200`, `4318`.
- API not scraping in Prometheus: verify API runs on `8031` and `/api/v1/metrics` is reachable.
- No traces in Grafana: verify OTel endpoint env vars and collector container health.
- No logs in Grafana Loki: set `LOG_TO_LOKI=true` and verify `LOKI_HOST`.
- No GA events: verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in deployed web env.
- Missing Sentry releases/source maps: verify `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.
