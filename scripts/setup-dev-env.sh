#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
MOBILE_ENV_FILE="${ROOT_DIR}/apps/mobile/.env"

log() {
  printf '\n[setup:dev] %s\n' "$1"
}

upsert_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  if [[ ! -f "$file" ]]; then
    touch "$file"
  fi

  if grep -qE "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >>"$file"
  fi
}

wait_for_postgres() {
  local retries=40
  local sleep_seconds=2

  for ((i = 1; i <= retries; i++)); do
    if DATABASE_URL="${DATABASE_URL}" node -e "const postgres=require('postgres');(async()=>{const sql=postgres(process.env.DATABASE_URL,{max:1,connect_timeout:2,idle_timeout:2});await sql\`select 1\`;await sql.end({timeout:1});})().catch(()=>process.exit(1));" >/dev/null 2>&1; then
      return 0
    fi
    printf '[setup:dev] waiting for postgres (%d/%d)\n' "$i" "$retries"
    sleep "$sleep_seconds"
  done

  return 1
}

load_env_vars() {
  local file="$1"

  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue

    local key="${line%%=*}"
    local value="${line#*=}"

    if [[ "$value" =~ ^\".*\"$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "$key=$value"
  done <"$file"
}

log "Preparing root .env"
if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f "${ROOT_DIR}/.env.example" ]]; then
    cp "${ROOT_DIR}/.env.example" "$ENV_FILE"
  else
    touch "$ENV_FILE"
  fi
fi

upsert_env_var "API_PORT" "8031" "$ENV_FILE"
upsert_env_var "WEB_PORT" "3001" "$ENV_FILE"
upsert_env_var "APP_NAME" "visiblefix-api" "$ENV_FILE"
upsert_env_var "NODE_ENV" "development" "$ENV_FILE"
upsert_env_var "DATABASE_URL" "postgres://postgres:postgres@localhost:5432/visiblefix" "$ENV_FILE"
upsert_env_var "NEXT_PUBLIC_API_URL" "http://localhost:8031/api/v1" "$ENV_FILE"
upsert_env_var "INTERNAL_API_URL" "http://127.0.0.1:8031" "$ENV_FILE"
upsert_env_var "JWT_ACCESS_SECRET" "visiblefix_dev_access_secret" "$ENV_FILE"
upsert_env_var "JWT_REFRESH_SECRET" "visiblefix_dev_refresh_secret" "$ENV_FILE"
upsert_env_var "JWT_ACCESS_TTL_SECONDS" "900" "$ENV_FILE"
upsert_env_var "JWT_REFRESH_TTL_SECONDS" "2592000" "$ENV_FILE"
upsert_env_var "ADMIN_EMAIL" "admin@visiblefix.local" "$ENV_FILE"
upsert_env_var "ADMIN_PASSWORD" "admin12345" "$ENV_FILE"
upsert_env_var "ADMIN_NAME" "VisibleFix_Dev_Admin" "$ENV_FILE"
upsert_env_var "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "" "$ENV_FILE"
upsert_env_var "NEXT_PUBLIC_GA_MEASUREMENT_ID" "" "$ENV_FILE"
upsert_env_var "OBJECT_STORAGE_PROVIDER" "local" "$ENV_FILE"
upsert_env_var "OBJECT_STORAGE_BUCKET" "visiblefix-dev" "$ENV_FILE"
upsert_env_var "OBJECT_STORAGE_PUBLIC_BASE_URL" "http://localhost:8031/uploads" "$ENV_FILE"
upsert_env_var "OBJECT_STORAGE_MAX_FILE_SIZE_BYTES" "10485760" "$ENV_FILE"
upsert_env_var "LOCAL_OBJECT_STORAGE_ROOT" "storage" "$ENV_FILE"
upsert_env_var "OBJECT_STORAGE_ENDPOINT" "http://localhost:9000" "$ENV_FILE"
upsert_env_var "OBJECT_STORAGE_REGION" "us-east-1" "$ENV_FILE"
upsert_env_var "OBJECT_STORAGE_ACCESS_KEY" "minioadmin" "$ENV_FILE"
upsert_env_var "OBJECT_STORAGE_SECRET_KEY" "minioadmin" "$ENV_FILE"
upsert_env_var "GCS_PROJECT_ID" "" "$ENV_FILE"
upsert_env_var "GCS_KEY_FILENAME" "" "$ENV_FILE"
upsert_env_var "GCS_MAKE_PUBLIC" "true" "$ENV_FILE"
upsert_env_var "LOG_LEVEL" "debug" "$ENV_FILE"
upsert_env_var "LOG_PRETTY" "true" "$ENV_FILE"
upsert_env_var "LOG_TO_LOKI" "false" "$ENV_FILE"
upsert_env_var "LOKI_HOST" "http://localhost:3100" "$ENV_FILE"
upsert_env_var "OTEL_SERVICE_NAME" "visiblefix-api" "$ENV_FILE"
upsert_env_var "OTEL_SDK_DISABLED" "false" "$ENV_FILE"
upsert_env_var "OTEL_LOG_LEVEL" "none" "$ENV_FILE"
upsert_env_var "OTEL_EXPORTER_OTLP_ENDPOINT" "http://localhost:4318" "$ENV_FILE"
upsert_env_var "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" "http://localhost:4318/v1/traces" "$ENV_FILE"
upsert_env_var "GOOGLE_CLOUD_PROJECT" "" "$ENV_FILE"
upsert_env_var "NEXT_PUBLIC_SENTRY_DSN" "" "$ENV_FILE"
upsert_env_var "SENTRY_DSN" "" "$ENV_FILE"
upsert_env_var "SENTRY_ORG" "" "$ENV_FILE"
upsert_env_var "SENTRY_PROJECT" "" "$ENV_FILE"
upsert_env_var "SENTRY_AUTH_TOKEN" "" "$ENV_FILE"
upsert_env_var "SENTRY_ENABLED" "false" "$ENV_FILE"
upsert_env_var "NEXT_PUBLIC_SENTRY_ENABLED" "false" "$ENV_FILE"
upsert_env_var "SENTRY_TRACES_SAMPLE_RATE" "0.1" "$ENV_FILE"
upsert_env_var "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE" "0.1" "$ENV_FILE"
upsert_env_var "SENTRY_ENVIRONMENT" "" "$ENV_FILE"
upsert_env_var "NEXT_PUBLIC_SENTRY_ENVIRONMENT" "" "$ENV_FILE"
upsert_env_var "SENTRY_RELEASE" "" "$ENV_FILE"
upsert_env_var "NEXT_PUBLIC_SENTRY_RELEASE" "" "$ENV_FILE"

log "Preparing mobile .env"
upsert_env_var "EXPO_PUBLIC_API_URL" "http://localhost:8031/api/v1" "$MOBILE_ENV_FILE"

log "Loading environment variables from .env"
load_env_vars "$ENV_FILE"

log "Starting local infrastructure (postgres + pgadmin)"
bash "${ROOT_DIR}/infra/compose-runner.sh" up -d

log "Waiting for postgres health"
if ! wait_for_postgres; then
  echo "[setup:dev] postgres did not become healthy in time"
  exit 1
fi

log "Applying database schema"
(cd "$ROOT_DIR" && DATABASE_URL="$DATABASE_URL" pnpm db:push)

log "Seeding deterministic development mock data"
(cd "$ROOT_DIR" && DATABASE_URL="$DATABASE_URL" node scripts/seed-dev.mjs)

log "Done"
cat <<'EOF'
[setup:dev] Development environment is ready.
[setup:dev] Default seeded accounts:
  - admin@visiblefix.local / admin12345
  - staff@visiblefix.local / staff12345
  - citizen@visiblefix.local / citizen12345

[setup:dev] Useful commands:
  pnpm infra:ps
  pnpm dev:api
  pnpm dev:web
  pnpm dev:mobile
EOF
