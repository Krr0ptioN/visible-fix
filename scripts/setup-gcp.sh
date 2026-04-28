#!/bin/bash

# VisibleFix GCP Setup Script
set -e

echo "☁️ Starting VisibleFix GCP setup..."

# 1. Authenticate with gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "🔐 Not authenticated with gcloud. Running login..."
    gcloud auth login
fi

# 2. Set Project
PROJECT_ID=$(gcloud config get-value project)
echo "🎯 Using Project ID: $PROJECT_ID"

# 3. Initialize Terraform
echo "🏗️ Initializing Terraform..."
cd infra
terraform init

# 4. Provision Infrastructure
echo "🚀 Provisioning GCP resources (Free Tier optimized)..."
echo "⚠️ You will be prompted for a database password."
terraform apply -var="google_project_id=$PROJECT_ID"

echo "✅ GCP Infrastructure provisioned!"
echo "💡 Use 'gh secret set' to add your project ID and WIF provider to GitHub."
