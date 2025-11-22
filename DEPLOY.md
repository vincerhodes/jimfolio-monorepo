# Deployment Guide (VPS)

This guide explains how to deploy the Jimfolio monorepo to a Virtual Private Server (VPS) without Docker, using **PM2** for process management and **Nginx** as a reverse proxy.

## 1. Prerequisites

Connect to your VPS via SSH and install the necessary tools:

### Install Node.js 20
```bash
# Download and setup NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify version
node -v # Should be v20.x.x
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Nginx
```bash
sudo apt-get update
sudo apt-get install -y nginx
```

## 2. Application Setup

### Transfer Files
Copy your project files to the VPS (e.g., to `/var/www/jimfolio` or `~/jimfolio`). You can use `scp`, `rsync`, or `git clone`.

> **Note:** You do NOT need to copy `node_modules` or `.next` folders. We will build them on the server.

### Install Dependencies
```bash
cd ~/jimfolio
npm install
```

### Build Applications
```bash
npm run build
```

### Database Setup (Sweet Reach)
Since Sweet Reach uses SQLite, ensure the database file exists or run migrations:
```bash
# Run migrations (if needed)
npx turbo run db:generate
# Or migrate specifically
cd apps/sweet-reach
npx prisma migrate deploy
```

## 3. Start with PM2

We use the `ecosystem.config.js` file to manage both applications.

```bash
# Start all apps
pm2 start ecosystem.config.js

# Save the process list to respawn on reboot
pm2 save

# Generate startup script
pm2 startup
# (Run the command output by the previous step)
```

### Managing Processes
```bash
# View status
pm2 status

# Monitor logs
pm2 logs

# Restart everything
pm2 restart all
```

## 4. Nginx Configuration

Configure Nginx to proxy traffic to your applications running on ports 3000 and 3001.

1.  **Copy the config file:**
    ```bash
    sudo cp deploy/nginx.conf /etc/nginx/sites-available/jimfolio
    ```

2.  **Enable the site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/jimfolio /etc/nginx/sites-enabled/
    ```

3.  **Test and Reload Nginx:**
    ```bash
    sudo nginx -t
    sudo systemctl reload nginx
    ```

## 5. SSL (HTTPS)

Use Certbot to automatically obtain free SSL certificates:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx
```

Follow the prompts to secure both `jimfolio.space` and `demo.jimfolio.space`.

---

## Troubleshooting

- **App not starting?** Check `pm2 logs`.
- **502 Bad Gateway?** The app might be down. Check if PM2 processes are online.
- **Port conflicts?** Ensure ports 3000 and 3001 are free.
