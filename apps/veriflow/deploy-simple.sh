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

# Navigate to app directory
cd apps/veriflow

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application using Turborepo
echo "🔨 Building application with Turborepo..."
cd "$MONOREPO_ROOT"
npm run build -- --filter=@jimfolio/veriflow

# Setup database
echo "🗄️ Setting up database..."
cd apps/veriflow
cp .env.production .env
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Start/restart with PM2
echo "🔄 Starting application with PM2..."
pm2 restart veriflow || pm2 start pm2.config.js

echo "✅ Deployment completed!"
echo "🌐 https://jimfolio.space/veriflow"
