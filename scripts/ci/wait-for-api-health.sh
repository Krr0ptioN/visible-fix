#!/usr/bin/env bash
set -euo pipefail

: "${API_URL:?API_URL is required}"
: "${HEALTH_PATH:=/api/v1/health}"
: "${MAX_RETRIES:=30}"
: "${RETRY_DELAY_SECONDS:=10}"

health_url="${API_URL}${HEALTH_PATH}"
echo "Checking health at ${health_url}"

for attempt in $(seq 1 "$MAX_RETRIES"); do
  response_file="$(mktemp)"
  error_file="$(mktemp)"
  status_code="$(
    curl \
      --silent \
      --show-error \
      --connect-timeout 5 \
      --max-time 10 \
      --output "$response_file" \
      --write-out "%{http_code}" \
      "$health_url" 2>"$error_file" || true
  )"
  status="$(jq -r '.status // empty' "$response_file" 2>/dev/null || true)"

  if [ "$status_code" = "200" ] && [ "$status" = "ok" ]; then
    echo "API is healthy"
    rm -f "$response_file" "$error_file"
    exit 0
  fi

  if [ -s "$error_file" ]; then
    echo "Health check request failed: $(cat "$error_file")"
  else
    echo "Health check returned HTTP ${status_code:-000} with status '${status:-unknown}'"
  fi
  rm -f "$response_file" "$error_file"

  echo "Waiting for API... (${attempt}/${MAX_RETRIES})"
  sleep "$RETRY_DELAY_SECONDS"
done

echo "Timed out waiting for API health"
exit 1
