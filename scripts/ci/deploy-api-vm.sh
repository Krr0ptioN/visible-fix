#!/usr/bin/env bash
set -euo pipefail

: "${API_INSTANCE:?API_INSTANCE is required}"
: "${API_ZONE:?API_ZONE is required}"
: "${ARTIFACT_REGION:?ARTIFACT_REGION is required}"
: "${GCP_PROJECT_ID:?GCP_PROJECT_ID is required}"
: "${IMAGE:?IMAGE is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${JWT_ACCESS_SECRET:?JWT_ACCESS_SECRET is required}"
: "${JWT_REFRESH_SECRET:?JWT_REFRESH_SECRET is required}"

encode_secret() {
  printf '%s' "$1" | base64 -w0
}

DATABASE_URL_B64="$(encode_secret "$DATABASE_URL")"
JWT_ACCESS_SECRET_B64="$(encode_secret "$JWT_ACCESS_SECRET")"
JWT_REFRESH_SECRET_B64="$(encode_secret "$JWT_REFRESH_SECRET")"

gcloud compute ssh "$API_INSTANCE" \
  --project="$GCP_PROJECT_ID" \
  --zone="$API_ZONE" \
  --quiet \
  --command="sudo bash -s" <<REMOTE
set -euo pipefail

mkdir -p /opt/visiblefix
mkdir -p /var/log/visiblefix
touch /var/log/visiblefix/api.log
chmod 0644 /var/log/visiblefix/api.log

DATABASE_URL="\$(printf '%s' '$DATABASE_URL_B64' | base64 -d)"
JWT_ACCESS_SECRET="\$(printf '%s' '$JWT_ACCESS_SECRET_B64' | base64 -d)"
JWT_REFRESH_SECRET="\$(printf '%s' '$JWT_REFRESH_SECRET_B64' | base64 -d)"

cat > /opt/visiblefix/api.env <<ENV
NODE_ENV=production
API_PORT=3000
GCP_PROJECT_ID=$GCP_PROJECT_ID
LOG_LEVEL=info
LOG_GOOGLE_CLOUD=true
LOG_PRETTY=false
LOG_TO_LOKI=false
DATABASE_URL=\$DATABASE_URL
JWT_ACCESS_SECRET=\$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=\$JWT_REFRESH_SECRET
ENV

cat > /etc/systemd/system/visiblefix-api.service <<SERVICE
[Unit]
Description=VisibleFix API container
After=docker.service
Requires=docker.service

[Service]
Restart=always
RestartSec=5
TimeoutStartSec=0
StandardOutput=append:/var/log/visiblefix/api.log
StandardError=append:/var/log/visiblefix/api.log
ExecStartPre=/usr/bin/gcloud auth configure-docker ${ARTIFACT_REGION}-docker.pkg.dev --quiet
ExecStartPre=/usr/bin/docker pull $IMAGE
ExecStartPre=-/usr/bin/docker rm -f visiblefix-api
ExecStart=/usr/bin/docker run --rm --log-driver=none --name visiblefix-api --env-file /opt/visiblefix/api.env -p 3000:3000 $IMAGE
ExecStop=/usr/bin/docker stop visiblefix-api

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable visiblefix-api
systemctl restart visiblefix-api
sleep 5
systemctl is-active --quiet visiblefix-api
docker image prune -af --filter "until=24h" || true
REMOTE
