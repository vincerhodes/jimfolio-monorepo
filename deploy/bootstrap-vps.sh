#!/bin/bash
# =============================================================================
# Jimfolio VPS Bootstrap Script
# =============================================================================
# Run this ONCE against a freshly wiped VPS.
# It will:
#   1. Accept root password login (entered once at prompt)
#   2. Create 'jimmy' user with passwordless sudo
#   3. Install your SSH key for 'jimmy'
#   4. Install Node.js 20, nginx, PM2, certbot
#   5. Copy nginx config and request SSL cert
#   6. Trigger the main deploy script
# =============================================================================

set -euo pipefail

VPS_IP="66.42.115.185"
VPS_DOMAIN="jimfolio.space"
JIMMY_USER="jimmy"
LOCAL_PUBKEY="$HOME/.ssh/id_ed25519.pub"
SSH_ALIAS="jimfolio"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}[$(date +'%H:%M:%S')] $*${NC}"; }
info()  { echo -e "${CYAN}[$(date +'%H:%M:%S')] $*${NC}"; }
warn()  { echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $*${NC}"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $*${NC}"; exit 1; }

[ -f "$LOCAL_PUBKEY" ] || error "SSH public key not found at $LOCAL_PUBKEY"
PUBKEY_CONTENT="$(cat "$LOCAL_PUBKEY")"

log "============================================="
log " Jimfolio VPS Bootstrap"
log " Target: root@$VPS_IP"
log "============================================="
info "You will be prompted for the ROOT password once."
info "After that, all further access uses your SSH key."
echo ""

# ---------------------------------------------------------------------------
# Upload the bootstrap commands via ssh as root (password auth)
# ---------------------------------------------------------------------------
ssh -o StrictHostKeyChecking=no \
    -o PreferredAuthentications=password \
    -o PubkeyAuthentication=no \
    root@"$VPS_IP" bash << REMOTE
set -euo pipefail

echo "[vps] Updating package list..."
apt-get update -qq

echo "[vps] Creating user '$JIMMY_USER'..."
if id "$JIMMY_USER" &>/dev/null; then
    echo "[vps] User '$JIMMY_USER' already exists — skipping creation."
else
    useradd -m -s /bin/bash "$JIMMY_USER"
    echo "[vps] User '$JIMMY_USER' created."
fi

echo "[vps] Adding '$JIMMY_USER' to sudo group..."
usermod -aG sudo "$JIMMY_USER"

echo "[vps] Granting passwordless sudo to '$JIMMY_USER'..."
echo "$JIMMY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/jimmy
chmod 440 /etc/sudoers.d/jimmy

echo "[vps] Installing SSH key for '$JIMMY_USER'..."
mkdir -p /home/$JIMMY_USER/.ssh
chmod 700 /home/$JIMMY_USER/.ssh
echo "$PUBKEY_CONTENT" > /home/$JIMMY_USER/.ssh/authorized_keys
chmod 600 /home/$JIMMY_USER/.ssh/authorized_keys
chown -R $JIMMY_USER:$JIMMY_USER /home/$JIMMY_USER/.ssh

echo "[vps] Installing Node.js 20 (NodeSource)..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "[vps] Node.js already installed: \$(node --version)"
fi

echo "[vps] Installing system packages (nginx, curl, git, certbot)..."
apt-get install -y nginx certbot python3-certbot-nginx git rsync ufw

echo "[vps] Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "[vps] Installing PM2 globally..."
npm install -g pm2

echo "[vps] Enabling nginx..."
systemctl enable nginx
systemctl start nginx || systemctl restart nginx

echo "[vps] Bootstrap complete. SSH key installed for $JIMMY_USER."
REMOTE

log "Phase 1 complete — jimmy user created with SSH key and sudo."
echo ""

# ---------------------------------------------------------------------------
# Verify jimmy SSH works
# ---------------------------------------------------------------------------
log "Verifying SSH access as jimmy..."
sleep 2
ssh -o StrictHostKeyChecking=accept-new \
    -o BatchMode=yes \
    -i "$HOME/.ssh/id_ed25519" \
    "$JIMMY_USER@$VPS_IP" "echo '[vps] jimmy SSH OK'" || error "Cannot SSH as jimmy — check key upload."
log "SSH as jimmy confirmed."

# ---------------------------------------------------------------------------
# Configure nginx (copy config, request SSL cert)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log "Uploading nginx config..."
scp -o StrictHostKeyChecking=accept-new \
    "$SCRIPT_DIR/nginx.conf" \
    "$JIMMY_USER@$VPS_IP:/tmp/jimfolio-nginx.conf"

ssh -o StrictHostKeyChecking=accept-new \
    -i "$HOME/.ssh/id_ed25519" \
    "$JIMMY_USER@$VPS_IP" bash << 'NGINX_SETUP'
set -euo pipefail

echo "[vps] Installing nginx config (HTTP-only first for certbot)..."
sudo tee /etc/nginx/sites-available/jimfolio > /dev/null << 'NGINX_HTTP'
server {
    listen 80;
    server_name jimfolio.space www.jimfolio.space demo.jimfolio.space;
    location / {
        return 200 'Bootstrap OK';
        add_header Content-Type text/plain;
    }
}
NGINX_HTTP

sudo ln -sf /etc/nginx/sites-available/jimfolio /etc/nginx/sites-enabled/jimfolio
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
echo "[vps] Nginx HTTP config active."
NGINX_SETUP

log "Requesting SSL certificate from Let's Encrypt..."
ssh -o StrictHostKeyChecking=accept-new \
    -i "$HOME/.ssh/id_ed25519" \
    "$JIMMY_USER@$VPS_IP" \
    "sudo certbot --nginx -d $VPS_DOMAIN -d www.$VPS_DOMAIN -d demo.$VPS_DOMAIN --non-interactive --agree-tos -m admin@$VPS_DOMAIN --redirect 2>&1 || echo 'CERTBOT_WARN: may need DNS to propagate, continuing...'"

log "Installing full nginx proxy config..."
ssh -o StrictHostKeyChecking=accept-new \
    -i "$HOME/.ssh/id_ed25519" \
    "$JIMMY_USER@$VPS_IP" bash << 'NGINX_FULL'
set -euo pipefail
sudo cp /tmp/jimfolio-nginx.conf /etc/nginx/sites-available/jimfolio
sudo nginx -t && sudo systemctl reload nginx
echo "[vps] Full nginx proxy config installed."
NGINX_FULL

# ---------------------------------------------------------------------------
# Set up PM2 startup as jimmy
# ---------------------------------------------------------------------------
log "Configuring PM2 startup..."
ssh -o StrictHostKeyChecking=accept-new \
    -i "$HOME/.ssh/id_ed25519" \
    "$JIMMY_USER@$VPS_IP" bash << 'PM2_SETUP'
set -euo pipefail
STARTUP_CMD=$(pm2 startup systemd -u jimmy --hp /home/jimmy 2>&1 | grep "sudo env" || true)
if [ -n "$STARTUP_CMD" ]; then
    eval "sudo $STARTUP_CMD" 2>/dev/null || sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u jimmy --hp /home/jimmy
fi
echo "[vps] PM2 startup configured."
PM2_SETUP

# ---------------------------------------------------------------------------
# Trigger the main deploy
# ---------------------------------------------------------------------------
log "============================================="
log " Bootstrap complete! Triggering deploy..."
log "============================================="

bash "$SCRIPT_DIR/deploy.sh" --skip-git "$@"

log "============================================="
log " VPS is fully set up and live!"
log " Site:  https://$VPS_DOMAIN"
log " SSH:   ssh $SSH_ALIAS"
log "============================================="
