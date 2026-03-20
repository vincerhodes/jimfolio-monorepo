#!/bin/bash
# =============================================================================
# Jimfolio Monorepo - Deployment Script
# =============================================================================
# Usage: ./deploy/deploy.sh [--message "commit message"] [--skip-git]
#
# Strategy: git push locally, then SSH → git pull + build on VPS.
# This avoids large tarball SCP transfers that can stall on slow connections.
#
# Steps:
#   1. Git commit all outstanding changes and push to GitHub
#   2. SSH into VPS: git pull, full npm ci, sequential Prisma+build for each
#      Prisma app (sweet-reach then veriflow) to avoid client conflicts, then
#      build remaining apps, set up runtime node_modules, reload PM2.
#
# Prisma isolation note:
#   sweet-reach and veriflow both write to the same root node_modules/@prisma/client.
#   Fix: build sweet-reach (with its Prisma client) first, then overwrite with
#   veriflow's client and build veriflow. After the build, sweet-reach gets its
#   own node_modules via npm ci --omit=dev so it has an isolated runtime client.
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
VPS_HOST="jimfolio"                           # SSH alias from ~/.ssh/config
VPS_DEPLOY_DIR="/home/jimmy/jimfolio-monorepo"
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

while [[ $# -gt 0 ]]; do
    case "$1" in
        --message|-m)
            COMMIT_MSG="$2"; shift 2 ;;
        --skip-git)
            SKIP_GIT=true; shift ;;
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
    log "Step 1/2: Committing and pushing to GitHub..."
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
    warn "Step 1/2: Skipping git (--skip-git flag set)."
fi

# ---------------------------------------------------------------------------
# Step 2 — Remote deploy via git pull + build on VPS
# ---------------------------------------------------------------------------
log "Step 2/2: Running remote deploy on VPS (git pull + build)..."
wait_for_ssh "before remote deploy"

ssh "$VPS_HOST" bash << 'ENDSSH'
set -euo pipefail

DEPLOY_DIR="/home/jimmy/jimfolio-monorepo"

echo "[remote] Pulling latest code..."
cd "$DEPLOY_DIR"
git pull origin main

echo "[remote] Installing all deps (including devDeps needed for build)..."
npm ci

echo "[remote] === Building sweet-reach (Prisma first, then build) ==="
(cd "$DEPLOY_DIR/apps/sweet-reach" && npx prisma generate)
npx turbo run build --filter=@jimfolio/sweet-reach

echo "[remote] === Building veriflow (Prisma second, overwrites root client) ==="
(cd "$DEPLOY_DIR/apps/veriflow" && npx prisma generate)
npx turbo run build --filter=@jimfolio/veriflow

echo "[remote] === Building all other apps ==="
npx turbo run build \
    --filter=!@jimfolio/sweet-reach \
    --filter=!@jimfolio/veriflow

echo "[remote] === Runtime setup: sweet-reach gets isolated node_modules ==="
rm -rf "$DEPLOY_DIR/apps/sweet-reach/node_modules"
(cd "$DEPLOY_DIR/apps/sweet-reach" && npm ci --omit=dev)
(cd "$DEPLOY_DIR/apps/sweet-reach" && npx prisma generate)
echo "[remote] sweet-reach runtime Prisma: OK"

echo "[remote] === Veriflow runtime Prisma (uses root node_modules) ==="
(cd "$DEPLOY_DIR/apps/veriflow" && npx prisma generate)
echo "[remote] veriflow runtime Prisma: OK"

echo "[remote] === Reloading PM2 ==="
if pm2 list | grep -q 'online'; then
    pm2 reload ecosystem.config.js --update-env
else
    pm2 start ecosystem.config.js
fi
pm2 save

echo "[remote] Done."
pm2 list
ENDSSH

log ""
log "==========================================="
log " Deployment complete!"
log "==========================================="
log " Site:     https://jimfolio.space"
log " SSH:      ssh $VPS_HOST"
log " PM2 logs: ssh $VPS_HOST 'pm2 logs'"
log "==========================================="
