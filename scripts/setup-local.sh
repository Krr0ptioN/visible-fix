#!/bin/bash

# VisibleFix Local Setup Script
set -e

echo "🚀 Starting VisibleFix local setup..."

# 1. Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not found. Installing..."
    npm install -g pnpm
fi

# 2. Install dependencies
echo "📦 Installing workspace dependencies..."
pnpm install

# 3. Setup environment files
if [ ! -f .env ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️ Please update .env with your local credentials."
fi

# 4. Initialize Infrastructure (Local Docker)
echo "🐳 Starting local infrastructure (Postgres)..."
npm run infra:up

# 5. Run migrations
echo "🗄️ Running database migrations..."
npm run db:generate
npm run db:push

echo "✅ Local setup complete!"
echo "💡 Run 'npx nx serve web' to start the frontend."
echo "💡 Run 'npx nx serve visiblefix-api' to start the backend."
