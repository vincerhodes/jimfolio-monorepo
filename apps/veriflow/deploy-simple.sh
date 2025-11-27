#!/bin/bash

# Simple deployment script for VeriFlow within monorepo
# Usage: ./deploy-simple.sh (run from monorepo root)

set -e

echo "🚀 Deploying VeriFlow Solutions in monorepo..."

# Navigate to app directory
cd apps/veriflow

# Install dependencies (from monorepo root if needed)
echo "📦 Installing dependencies..."
npm ci

# Build the application using Turborepo
echo "🔨 Building application with Turborepo..."
cd ../../
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
