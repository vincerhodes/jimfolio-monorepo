# VeriFlow Solutions VPS Deployment Guide

This guide will help you deploy the VeriFlow Solutions Next.js application to your VPS at `jimfolio.space/veriflow`.

## Prerequisites

- Ubuntu 20.04+ or Debian 10+ server
- Node.js 18+ installed
- Nginx installed and configured
- PM2 installed globally
- Domain pointing to your VPS (jimfolio.space)
- SSL certificate (Let's Encrypt recommended)

## Quick Deployment

### 1. Upload Files to VPS

```bash
# On your local machine, upload the app files
scp -r /path/to/veriflow user@your-vps-ip:/tmp/

# SSH into your VPS
ssh user@your-vps-ip
```

### 2. Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d jimfolio.space

# Follow the prompts to configure auto-renewal
```

### 3. Deploy the Application

```bash
# Move to deployment directory
sudo mv /tmp/veriflow /var/www/jimfolio.space/
cd /var/www/jimfolio.space/veriflow

# Make deployment script executable
chmod +x deploy.sh

# Run deployment (production)
sudo ./deploy.sh production

# Or for staging with seed data
sudo ./deploy.sh staging --seed
```

## Manual Deployment Steps

If you prefer manual deployment instead of the automated script:

### 1. Setup Application Directory

```bash
sudo mkdir -p /var/www/jimfolio.space/veriflow
cd /var/www/jimfolio.space/veriflow
```

### 2. Install Dependencies

```bash
npm ci --production=false
npm run build
npm ci --production
```

### 3. Configure Environment

```bash
cp .env.production .env
# Edit .env with your production values
```

### 4. Setup Database

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed  # Optional: for demo data
```

### 5. Configure PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 6. Configure Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/veriflow
sudo ln -s /etc/nginx/sites-available/veriflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Configuration Files

### Nginx Configuration

The `nginx.conf` file includes:
- SSL termination
- Proxy to Next.js on port 3003
- Static asset caching
- Security headers
- Gzip compression

### PM2 Configuration

The `ecosystem.config.js` file includes:
- Process management
- Auto-restart on failure
- Memory limits
- Log file configuration
- Environment variables

### Next.js Configuration

The `next.config.ts` file includes:
- `basePath: '/veriflow'` for subdirectory deployment
- `assetPrefix: '/veriflow'` for static assets
- `trailingSlash: true` for proper routing

## Environment Variables

Key production environment variables:

```bash
DATABASE_URL="file:/var/www/jimfolio.space/veriflow/prisma/production.db"
NODE_ENV="production"
PORT="3003"
NEXTAUTH_URL="https://jimfolio.space/veriflow"
```

## Monitoring and Maintenance

### PM2 Commands

```bash
pm2 list                    # List all processes
pm2 logs veriflow          # View application logs
pm2 restart veriflow       # Restart application
pm2 reload veriflow        # Reload application
pm2 monit                  # Monitor dashboard
```

### Log Files

- Application logs: `/var/log/pm2/veriflow-*.log`
- Nginx logs: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- System logs: `journalctl -u nginx`

### Backup Strategy

The deployment script automatically creates backups in `/var/backups/veriflow/`. For additional backup:

```bash
# Backup database
sudo cp /var/www/jimfolio.space/veriflow/prisma/production.db /var/backups/veriflow/db-$(date +%Y%m%d).db

# Backup entire application
sudo tar -czf /var/backups/veriflow/app-$(date +%Y%m%d).tar.gz /var/www/jimfolio.space/veriflow
```

## Troubleshooting

### Common Issues

1. **404 Errors**: Check nginx configuration and ensure basePath is set correctly
2. **Database Errors**: Verify DATABASE_URL path and file permissions
3. **Build Failures**: Check Node.js version and clear `.next` directory
4. **SSL Issues**: Verify certificate paths and nginx SSL configuration

### Health Check

```bash
# Check if application is running
curl -f https://jimfolio.space/veriflow

# Check PM2 status
pm2 list | grep veriflow

# Check nginx status
sudo systemctl status nginx
```

### Performance Optimization

```bash
# Enable nginx caching
sudo nginx -t && sudo systemctl reload nginx

# Monitor memory usage
pm2 monit

# Optimize database (if using PostgreSQL)
npx prisma db push
```

## Security Considerations

1. **SSL/TLS**: Always use HTTPS in production
2. **Firewall**: Configure UFW to allow only necessary ports
3. **Updates**: Keep Node.js, npm, and system packages updated
4. **Permissions**: Ensure proper file permissions (www-data user)
5. **Environment Variables**: Never commit secrets to version control

## Scaling Considerations

For production scaling:

1. **Database**: Consider PostgreSQL for better performance
2. **CDN**: Use CloudFlare or similar for static assets
3. **Load Balancing**: Multiple Node.js instances behind nginx
4. **Monitoring**: Add application monitoring (PM2 Monitoring, New Relic)
5. **Logging**: Centralized logging with ELK stack or similar

## Support

If you encounter issues:

1. Check logs: `pm2 logs veriflow`
2. Verify configuration: `nginx -t`
3. Test locally: `npm run build && npm start`
4. Check environment variables: `cat .env`

## Deployment URL

After successful deployment, your application will be available at:

**https://jimfolio.space/veriflow**
