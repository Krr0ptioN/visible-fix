#!/usr/bin/env bash
set -euo pipefail

: "${API_URL:?API_URL is required}"
: "${HEALTH_PATH:=/api/v1/health}"
: "${MAX_RETRIES:=30}"
: "${RETRY_DELAY_SECONDS:=10}"

health_url="${API_URL}${HEALTH_PATH}"
echo "Checking health at ${health_url}"

for attempt in $(seq 1 "$MAX_RETRIES"); do
  status_code="$(curl -s -o /dev/null -w "%{http_code}" "$health_url")"
  status="$(curl -s "$health_url" | jq -r '.status // empty')"

  if [ "$status_code" = "200" ] && [ "$status" = "ok" ]; then
    echo "API is healthy"
    exit 0
  fi

  echo "Waiting for API... (${attempt}/${MAX_RETRIES})"
  sleep "$RETRY_DELAY_SECONDS"
done

echo "Timed out waiting for API health"
exit 1
