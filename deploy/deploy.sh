#!/bin/bash
# =============================================================================
# Jimfolio Monorepo - Local Deployment Script
# =============================================================================
# Usage: ./deploy/deploy.sh [--message "commit message"] [--skip-git] [--skip-build]
#
# Steps:
#   1. Git commit all outstanding changes and push to GitHub
#   2. Build all apps via Turbo
#   3. Package everything into a tarball (no node_modules)
#   4. SCP tarball to VPS
#   5. SSH into VPS and run remote-deploy.sh
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
VPS_HOST="jimfolio"                           # SSH alias from ~/.ssh/config
VPS_DEPLOY_DIR="/home/jimmy/jimfolio-monorepo"
VPS_TARBALL_PATH="/tmp/jimfolio-deploy.tar.gz"
LOCAL_TARBALL="/tmp/jimfolio-deploy.tar.gz"
SSH_READY_ATTEMPTS=12
SSH_READY_DELAY=20

# ---------------------------------------------------------------------------
# Colours
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()     { echo -e "${GREEN}[$(date +'%H:%M:%S')] $*${NC}"; }
info()    { echo -e "${CYAN}[$(date +'%H:%M:%S')] $*${NC}"; }
warn()    { echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $*${NC}"; }
error()   { echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $*${NC}"; exit 1; }

wait_for_ssh() {
    local context="$1"
    local attempt=1

    while [ "$attempt" -le "$SSH_READY_ATTEMPTS" ]; do
        if ssh -o BatchMode=yes -o ConnectTimeout=5 "$VPS_HOST" true >/dev/null 2>&1; then
            log "SSH ready on $VPS_HOST ($context)."
            return 0
        fi

        warn "SSH not ready on $VPS_HOST ($context). Retry $attempt/$SSH_READY_ATTEMPTS in ${SSH_READY_DELAY}s."
        sleep "$SSH_READY_DELAY"
        attempt=$((attempt + 1))
    done

    error "SSH on $VPS_HOST did not become ready ($context)."
}

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
COMMIT_MSG="chore: deploy $(date +'%Y-%m-%d %H:%M')"
SKIP_GIT=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --message|-m)
            COMMIT_MSG="$2"; shift 2 ;;
        --skip-git)
            SKIP_GIT=true; shift ;;
        --skip-build)
            SKIP_BUILD=true; shift ;;
        *)
            error "Unknown argument: $1" ;;
    esac
done

# ---------------------------------------------------------------------------
# Resolve repo root (script can be called from any directory)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

info "Repo root: $REPO_ROOT"

# ---------------------------------------------------------------------------
# Step 1 — Git commit & push
# ---------------------------------------------------------------------------
if [ "$SKIP_GIT" = false ]; then
    log "Step 1/5: Committing and pushing to GitHub..."
    cd "$REPO_ROOT"

    git add -A

    if git diff --cached --quiet; then
        warn "Nothing staged to commit — working tree is clean, skipping commit."
    else
        git commit -m "$COMMIT_MSG"
        log "Committed: $COMMIT_MSG"
    fi

    CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
    git push origin "$CURRENT_BRANCH"
    log "Pushed branch '$CURRENT_BRANCH' to origin."
else
    warn "Step 1/5: Skipping git (--skip-git flag set)."
fi

# ---------------------------------------------------------------------------
# Step 2 — Build
# ---------------------------------------------------------------------------
if [ "$SKIP_BUILD" = false ]; then
    log "Step 2/5: Building all apps via Turbo..."
    cd "$REPO_ROOT"
    npm run build
    log "Build complete."
else
    warn "Step 2/5: Skipping build (--skip-build flag set)."
fi

# ---------------------------------------------------------------------------
# Step 3 — Create tarball
# ---------------------------------------------------------------------------
log "Step 3/5: Creating deployment tarball..."
cd "$REPO_ROOT"

# Include everything except node_modules, .git, turbo cache, and temp files.
# Build artefacts (.next/*, dist/*) ARE included because we built locally.
tar --exclude='./node_modules' \
    --exclude='./.git' \
    --exclude='./.turbo' \
    --exclude='./apps/*/node_modules' \
    --exclude='./apps/*/.next/cache' \
    --exclude='./packages/*/node_modules' \
    --exclude='./apps/veriflow/prisma/production.db' \
    --exclude='./apps/sweet-reach/sweet-reach-data' \
    --exclude='*.log' \
    -czf "$LOCAL_TARBALL" \
    .

TARBALL_SIZE=$(du -sh "$LOCAL_TARBALL" | cut -f1)
log "Tarball created: $LOCAL_TARBALL ($TARBALL_SIZE)"

# ---------------------------------------------------------------------------
# Step 4 — Transfer to VPS
# ---------------------------------------------------------------------------
log "Step 4/5: Uploading tarball to VPS..."
wait_for_ssh "before upload"
scp "$LOCAL_TARBALL" "${VPS_HOST}:${VPS_TARBALL_PATH}"
log "Upload complete."

# ---------------------------------------------------------------------------
# Step 5 — Remote deploy
# ---------------------------------------------------------------------------
log "Step 5/5: Running remote deploy on VPS..."
wait_for_ssh "before remote deploy"
ssh "$VPS_HOST" bash << ENDSSH
set -euo pipefail

TARBALL="${VPS_TARBALL_PATH}"
DEPLOY_DIR="${VPS_DEPLOY_DIR}"
BACKUP_DIR="/tmp/jimfolio-backup-\$(date +'%Y%m%d-%H%M%S')"

echo "[remote] Backing up source files to \$BACKUP_DIR ..."
if [ -d "\$DEPLOY_DIR" ]; then
    mkdir -p "\$BACKUP_DIR"
    rsync -a --exclude='node_modules' --exclude='.next' --exclude='.turbo' \
        "\$DEPLOY_DIR/" "\$BACKUP_DIR/" 2>/dev/null || true
fi

echo "[remote] Unpacking tarball..."
mkdir -p "\$DEPLOY_DIR"
tar -xzf "\$TARBALL" -C "\$DEPLOY_DIR"

echo "[remote] Installing root workspace dependencies..."
cd "\$DEPLOY_DIR"
rm -rf "\$DEPLOY_DIR/node_modules"
npm ci --omit=dev

echo "[remote] Installing typescript (needed by Next.js to load next.config.ts)..."
npm install typescript --no-save

echo "[remote] Installing deps for apps with own lock files..."
for app in jimfolio sweet-reach; do
    if [ -f "\$DEPLOY_DIR/apps/\$app/package-lock.json" ]; then
        echo "[remote]   -> \$app"
        cd "\$DEPLOY_DIR/apps/\$app"
        rm -rf "\$DEPLOY_DIR/apps/\$app/node_modules"
        npm ci --omit=dev
    fi
done
cd "\$DEPLOY_DIR"

echo "[remote] Generating Prisma clients..."
(cd "\$DEPLOY_DIR/apps/sweet-reach" && npx prisma generate) || true
(cd "\$DEPLOY_DIR/apps/veriflow"    && npx prisma generate) || true

echo "[remote] Reloading PM2 processes..."
cd "\$DEPLOY_DIR"
if pm2 list | grep -q 'jimfolio'; then
    pm2 reload ecosystem.config.js --update-env
else
    pm2 start ecosystem.config.js
fi
pm2 save

echo "[remote] Cleaning up tarball..."
rm -f "\$TARBALL"

echo "[remote] Done."
pm2 list
ENDSSH

# ---------------------------------------------------------------------------
# Cleanup local tarball
# ---------------------------------------------------------------------------
rm -f "$LOCAL_TARBALL"

log ""
log "==========================================="
log " Deployment complete!"
log "==========================================="
log " Site:     https://jimfolio.space"
log " SSH:      ssh $VPS_HOST"
log " PM2 logs: ssh $VPS_HOST 'pm2 logs'"
log "==========================================="
