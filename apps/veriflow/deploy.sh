#!/bin/bash

# VeriFlow Solutions Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

# Configuration
APP_NAME="veriflow"
DEPLOY_PATH="/var/www/jimfolio.space/veriflow"
BACKUP_PATH="/var/backups/veriflow"
LOG_PATH="/var/log/pm2"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root or with sudo"
fi

# Parse environment argument
ENVIRONMENT=${1:-production}
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    error "Environment must be 'production' or 'staging'"
fi

log "Starting deployment of VeriFlow Solutions to $ENVIRONMENT environment"

# Create necessary directories
log "Creating directories..."
mkdir -p "$DEPLOY_PATH"
mkdir -p "$BACKUP_PATH"
mkdir -p "$LOG_PATH"

# Backup current deployment if it exists
if [ -d "$DEPLOY_PATH" ] && [ "$(ls -A $DEPLOY_PATH)" ]; then
    log "Backing up current deployment..."
    BACKUP_NAME="$APP_NAME-$(date +%Y%m%d-%H%M%S)"
    cp -r "$DEPLOY_PATH" "$BACKUP_PATH/$BACKUP_NAME"
    log "Backup created at $BACKUP_PATH/$BACKUP_NAME"
fi

# Copy application files
log "Copying application files..."
cp -r . "$DEPLOY_PATH/"
cd "$DEPLOY_PATH"

# Install dependencies
log "Installing dependencies..."
npm ci --production=false

# Build the application
log "Building Next.js application..."
npm run build

# Install production dependencies
log "Installing production dependencies..."
npm ci --production

# Setup database
log "Setting up database..."
if [ "$ENVIRONMENT" = "production" ]; then
    cp .env.production .env
else
    cp .env.example .env
fi

# Generate Prisma client
log "Generating Prisma client..."
npx prisma generate

# Run database migrations
log "Running database migrations..."
npx prisma migrate deploy

# Seed database (only in staging or if explicitly requested)
if [ "$ENVIRONMENT" = "staging" ] || [ "$2" = "--seed" ]; then
    log "Seeding database..."
    npx prisma db seed
fi

# Set proper permissions
log "Setting permissions..."
chown -R www-data:www-data "$DEPLOY_PATH"
chmod -R 755 "$DEPLOY_PATH"
chmod 600 "$DEPLOY_PATH/.env"

# Setup PM2
log "Setting up PM2..."
if ! command -v pm2 &> /dev/null; then
    log "Installing PM2..."
    npm install -g pm2
fi

# Setup PM2 startup script
log "Configuring PM2 startup..."
pm2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u www-data --hp /var/www

# Start/restart application with PM2
log "Starting application with PM2..."
pm2 reload ecosystem.config.js --env $ENVIRONMENT || pm2 start ecosystem.config.js --env $ENVIRONMENT
pm2 save

# Setup log rotation for PM2 logs
log "Setting up log rotation..."
cat > /etc/logrotate.d/pm2-veriflow << EOF
$LOG_PATH/veriflow-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Setup nginx configuration
log "Setting up nginx configuration..."
if [ -f nginx.conf ]; then
    cp nginx.conf /etc/nginx/sites-available/veriflow
    ln -sf /etc/nginx/sites-available/veriflow /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    log "Nginx configuration updated"
else
    warning "nginx.conf not found, please configure nginx manually"
fi

# Health check
log "Performing health check..."
sleep 5
if pm2 list | grep -q "$APP_NAME.*online"; then
    log "✅ Application is running successfully"
else
    error "❌ Application failed to start"
fi

# Display deployment summary
log "🎉 Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 list | grep "$APP_NAME"
echo ""
echo "🌐 Application URL: https://jimfolio.space/veriflow"
echo "📋 PM2 Commands:"
echo "  pm2 list          - List all processes"
echo "  pm2 logs $APP_NAME - View application logs"
echo "  pm2 restart $APP_NAME - Restart application"
echo "  pm2 reload $APP_NAME - Reload application"
echo ""
echo "📁 Deployment Path: $DEPLOY_PATH"
echo "📋 Log Files: $LOG_PATH/"
echo "💾 Backups: $BACKUP_PATH/"
echo ""
log "Deployment completed at $(date)"
