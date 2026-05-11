# Setup & Deployment Guide

This guide covers the three main environments for VisibleFix: Local Development, GCP (Infrastructure), and Production.

---

## 💻 1. Local Development Setup

The fastest way to get started is using the automated setup script.

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Docker & Docker Compose](https://www.docker.com/)
- [pnpm](https://pnpm.io/)

### Quick Start
```bash
# Make script executable
chmod +x scripts/setup-local.sh

# Run the setup
./scripts/setup-local.sh
```

### Manual Steps
1.  **Dependencies:** `pnpm install`
2.  **Environment:** `cp .env.example .env`
3.  **Local DB:** `npm run infra:up` (Starts Postgres in Docker)
4.  **Migrations:** `npm run db:push`
5.  **Run Apps:**
    - Frontend: `npx nx serve web`
    - Backend: `npx nx serve visiblefix-api`

---

## ☁️ 2. GCP Infrastructure Setup (Free Tier)

We use Terraform to provision a cost-optimized stack on Google Cloud.

### Prerequisites
- [gcloud CLI](https://cloud.google.com/sdk/docs/install)
- [Terraform](https://www.terraform.io/)

### Provisioning
```bash
# Authenticate and Apply
chmod +x scripts/setup-gcp.sh
./scripts/setup-gcp.sh
```

### Cost Optimization Notes
- **Compute Engine:** Uses an `e2-micro` API VM in `us-central1-a`.
- **Database:** Neon hosts production PostgreSQL outside the GCP Terraform stack.
- **Artifact Registry:** Minimal storage usage for Docker images.

---

## 🚀 3. Production Deployment (CI/CD)

Deployments are fully automated via GitHub Actions.

### A. GitHub Secrets Setup
Ensure the following secrets are set in your repository:

| Secret | Description |
| :--- | :--- |
| `VERCEL_TOKEN` | Vercel API Token |
| `VERCEL_ORG_ID` | Vercel Organization ID |
| `VERCEL_PROJECT_ID` | Vercel Project ID |
| `GCP_PROJECT_ID` | Your GCP Project ID (e.g., `visiblefix`) |
| `GCP_WIF_PROVIDER` | Workload Identity Provider ID |
| `GCP_SERVICE_ACCOUNT` | `github-actions-deployer@...` |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | API access-token signing secret |
| `JWT_REFRESH_SECRET` | API refresh-token signing secret |

### B. Deployment Flow
1.  **Merge to `main`**: Triggers the CI/CD pipeline.
2.  **Frontend**: Next.js app is deployed to **Vercel**.
3.  **Backend**: NestJS API is containerized and deployed to **Google Compute Engine**.
4.  **Database**: Managed by **Neon**.

### C. Compute Engine Access
The GitHub Actions deployer service account needs Compute Engine instance access and Artifact Registry write
access so the API workflow can push images and restart the container on the API VM. The VM uses its own service
account with Artifact Registry read access so it can pull the latest image. These bindings are managed in
`infra/backend.tf`.

---

## 🛠️ Utility Scripts

- `scripts/setup-local.sh`: Local dev environment initialization.
- `scripts/setup-gcp.sh`: Cloud infrastructure provisioning.
- `scripts/db-tunnel.sh`: (Coming Soon) Connect to production DB from your local machine.
