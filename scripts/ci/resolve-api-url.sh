#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?GCP_PROJECT_ID is required}"
: "${ARTIFACT_REGION:?ARTIFACT_REGION is required}"
: "${API_ADDRESS_NAME:=visiblefix-api-ip}"
: "${API_PORT:=3000}"

api_ip="$(gcloud compute addresses describe "$API_ADDRESS_NAME" \
  --project="$GCP_PROJECT_ID" \
  --region="$ARTIFACT_REGION" \
  --format='value(address)')"

api_url="http://${api_ip}:${API_PORT}"

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "api_url=${api_url}" >> "$GITHUB_OUTPUT"
else
  printf '%s\n' "$api_url"
fi
