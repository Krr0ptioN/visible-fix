#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="infra/docker-compose.yml"
PREFERRED_RUNTIME="${CONTAINER_RUNTIME:-}"

run_compose() {
  local runtime="$1"
  shift

  if [[ "$runtime" == "podman" ]]; then
    if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
      podman compose -f "$COMPOSE_FILE" "$@"
      return 0
    fi

    if command -v podman-compose >/dev/null 2>&1; then
      podman-compose -f "$COMPOSE_FILE" "$@"
      return 0
    fi

    return 1
  fi

  if [[ "$runtime" == "docker" ]]; then
    if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
      docker compose -f "$COMPOSE_FILE" "$@"
      return 0
    fi

    if command -v docker-compose >/dev/null 2>&1; then
      docker-compose -f "$COMPOSE_FILE" "$@"
      return 0
    fi

    return 1
  fi

  return 1
}

if [[ -n "$PREFERRED_RUNTIME" ]]; then
  if run_compose "$PREFERRED_RUNTIME" "$@"; then
    exit 0
  fi
  echo "Requested runtime '$PREFERRED_RUNTIME' is unavailable." >&2
  exit 1
fi

if run_compose podman "$@"; then
  exit 0
fi

if run_compose docker "$@"; then
  exit 0
fi

cat >&2 <<'EOF'
No Compose runtime found.

Install one of the following:
  - podman + podman compose (or podman-compose)
  - docker + docker compose (or docker-compose)

Optional:
  Set CONTAINER_RUNTIME=podman or CONTAINER_RUNTIME=docker to force one.
EOF

exit 1
