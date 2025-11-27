#!/bin/bash

# Simple deployment script for VeriFlow within monorepo
# Usage: ./deploy-simple.sh (run from any directory)

set -e

echo "🚀 Deploying VeriFlow Solutions in monorepo..."

# Detect if we're in the app directory or monorepo root
if [[ "$(basename "$PWD")" == "veriflow" ]]; then
    echo "📍 Detected app directory, navigating to monorepo root..."
    cd ../../
    MONOREPO_ROOT="$PWD"
else
    echo "📍 Assuming we're in monorepo root..."
    MONOREPO_ROOT="$PWD"
fi

# Install dependencies from monorepo root
echo "📦 Installing monorepo dependencies..."
npm ci

# Setup database BEFORE building (required for API routes that execute at build time)
echo "🗄️ Setting up database..."
cd apps/veriflow
cp .env.production .env
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Verify database file exists before build
echo "🔍 Verifying database file exists..."
if [ ! -f "prisma/production.db" ]; then
    echo "❌ Database file not found, creating empty database..."
    touch prisma/production.db
    npx prisma db push
fi
echo "✅ Database file verified: $(ls -la prisma/production.db)"

# Build the application using Turborepo from monorepo root
echo "🔨 Building application with Turborepo..."
cd "$MONOREPO_ROOT"
cd apps/veriflow
rm -rf .next
cd "$MONOREPO_ROOT"
# Try direct Next.js build instead of Turborepo to isolate the issue
cd apps/veriflow
npm run build

# Start/restart with PM2
echo "🔄 Starting application with PM2..."
pm2 restart veriflow || pm2 start pm2.config.js

echo "✅ Deployment completed!"
echo "🌐 https://jimfolio.space/veriflow"
