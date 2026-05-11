#!/usr/bin/env bash
set -euo pipefail

: "${IMAGE:?IMAGE is required}"

docker build -t "$IMAGE" .
docker push "$IMAGE"
