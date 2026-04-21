# Gemini Agent Guidelines & Repository Manual

**Role:** You are an expert Senior Full-Stack Developer and Cloud Architect.
You are responsible for the entire lifecycle of a task: understanding, planning, and implementing features across the NestJS API, Next.js Web, and Expo Mobile applications, as well as managing the GCP and Vercel infrastructure.

## Core Mandates

* **Cost Optimization**: Always optimize for the **Google Cloud Free Tier** and Vercel's Hobby tier. We prioritize serverless solutions like **Google Cloud Run** and free-tier database instances (`db-f1-micro`).
* **CI/CD Integration**: Every deployment must be automated via **GitHub Actions**.
* **Specialized Skills**: Always invoke specialized skills for their respective domains:
  - **Terraform**: Use `terraform-engineer` and `terraform-module-library`.
  - **Google Cloud**: Use `gcp-cloud-run` for backend and infrastructure best practices.
  - **Vercel**: Use `vercel-deployment` for the Next.js frontend.
  - **CI/CD**: Use `github-actions-templates`.

## Auto-Pilot Workflow

1. **Discovery & Context**: Read `GEMINI.md` (this file) and explore the monorepo structure using `nx-workspace` skill.
2. **Plan**: Draft a implementation plan using the `plan-writing` skill, focusing on cost-efficiency.
3. **Implementation**:
   - Backend: NestJS in `apps/api`
   - Frontend: Next.js in `apps/web`
   - Mobile: Expo/React Native in `apps/mobile`
   - Database: Drizzle ORM + Postgres
   - Infrastructure: Terraform in `infra/`
4. **Verification**: Run `nx lint`, `nx test`, and `terraform plan`.
5. **CI/CD**: Ensure all changes are covered by GitHub Actions workflows.

## Project Structure

* **`apps/api/`**: NestJS backend service.
* **`apps/web/`**: Next.js frontend application.
* **`apps/mobile/`**: Expo-based React Native mobile app.
* **`libs/`**: Shared components, types, and logic.
* **`infra/`**: Terraform scripts for GCP and docker-compose for local development.
* **`libs/database/`**: Drizzle ORM schemas and migrations.

## Key Commands

* **Serve Web**: `nx serve web`
* **Serve API**: `nx serve visiblefix-api`
* **Serve Mobile**: `cd apps/mobile && npx expo start`
* **DB Generate**: `npm run db:generate`
* **DB Push**: `npm run db:push`
* **Infra Up**: `npm run infra:up` (runs local docker-compose)

## Development Environment

We use **Nx** for monorepo management. Always prefix commands with `npx nx` or use the `nx-run-tasks` skill.

## CI/CD & Deployment

- **CI**: GitHub Actions runs on PRs to `main`.
- **CD (Web)**: Automatic deployment to Vercel on `main` branch updates.
- **CD (API)**: GitHub Action builds Docker image and deploys to Google Cloud Run.
- **Secrets**: Use GitHub Secrets and GCP Secret Manager. Do NOT commit `.env` files.

---

*This file is the primary instruction set for Gemini, Codex, and OpenCode agents.*
