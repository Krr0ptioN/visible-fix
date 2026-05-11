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
- **Cloud Run:** Scaled to max 1 instance, scales to zero when idle ($0 cost).
- **Cloud SQL:** Using `db-f1-micro` which is eligible for the GCP Always Free tier (1 instance/month).
- **Artifact Registry:** Minimal storage usage for Docker images.

---

## 🎯 2.5. Staging Environment Setup

Before deploying to production, establish a staging environment for end-to-end testing.

### Prerequisites
- Google Cloud project for staging (e.g., `visiblefix-staging`)
- Vercel staging project (e.g., `visiblefix-staging`)
- GitHub secrets configured for staging

### Staging Infrastructure
```bash
# Create staging resources
cd infra
terraform init
terraform apply -var-file=staging.tfvars
```

This creates:
- Cloud SQL database: `visiblefix_staging`
- Cloud Run service: `visiblefix-api-staging`
- Docker images tagged `:staging`

### GitHub Secrets for Staging
| Secret | Description |
| :--- | :--- |
| `VERCEL_STAGING_PROJECT_ID` | Vercel staging project ID |
| `STAGING_DATABASE_URL` | Staging database connection |
| `STAGING_GOOGLE_PROJECT_ID` | Staging GCP project ID |

### Staging Deployment
- **Push to `main`**: Deploys to staging (without `--prod` flag)
- **PR preview**: Vercel creates preview deployments
- **Production**: Manual promotion after staging verification

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
| `DB_PASSWORD` | The Postgres password you set during GCP setup |

### B. Deployment Flow
1.  **Merge to `main`**: Triggers the CI/CD pipeline.
2.  **Frontend**: Next.js app is deployed to **Vercel**.
3.  **Backend**: NestJS API is containerized and deployed to **Google Cloud Run**.
4.  **Database**: Managed by **Google Cloud SQL**.

### C. Cloud SQL Access
The GitHub Actions deployer service account needs the `roles/cloudsql.client` role so the API workflow can
open the Cloud SQL Auth Proxy and run schema setup before deployment. This binding is managed in Terraform
under `infra/backend.tf`.

---

## 🛠️ Utility Scripts

- `scripts/setup-local.sh`: Local dev environment initialization.
- `scripts/setup-gcp.sh`: Cloud infrastructure provisioning.
- `scripts/db-tunnel.sh`: (Coming Soon) Connect to production DB from your local machine.
