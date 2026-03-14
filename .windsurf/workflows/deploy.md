---
description: Deploy jimfolio monorepo to VPS (commit, push, build, tarball, transfer, restart PM2)
---

## Deploy Jimfolio Monorepo to Production VPS

Runs the full deployment pipeline:
1. Commits all outstanding changes and pushes to GitHub
2. Builds all apps via Turbo (`npm run build`)
3. Packages the repo into a tarball (source + build artefacts, no `node_modules`)
4. SCPs the tarball to the VPS at `jimfolio:/tmp/jimfolio-deploy.tar.gz`
5. SSHs into the VPS, unpacks, installs production deps, regenerates Prisma clients, and reloads PM2

### Prerequisites
- SSH alias `jimfolio` must be configured in `~/.ssh/config` (host `45.76.252.59`, user `jimmy`)
- SSH key must be present on the server (`~/.ssh/authorized_keys`)
- PM2 must be running on the VPS with the monorepo's `ecosystem.config.js`
- Node 20+ and npm 10+ on both local machine and VPS

### Standard deploy

Run from the repo root:

```bash
bash deploy/deploy.sh
```

Optional flags:

```bash
# Custom commit message
bash deploy/deploy.sh --message "feat: update portfolio hero section"

# Skip git commit/push (e.g. already pushed manually)
bash deploy/deploy.sh --skip-git

# Skip build (e.g. redeploying a previous build)
bash deploy/deploy.sh --skip-build

# Combine flags
bash deploy/deploy.sh --skip-git --message "hotfix: typo"
```

### What gets packaged in the tarball

Included:
- All source files
- `.next/` build artefacts for each Next.js app (built locally before packing)
- `ecosystem.config.js`, `package.json`, `turbo.json`
- `deploy/` directory (including `deploy.sh` itself)

Excluded:
- `node_modules/` (all levels — reinstalled on VPS)
- `.git/`, `.turbo/` cache
- `.next/cache/` (unnecessary artefact cache)
- SQLite production databases
- `*.log` files

### VPS remote steps (automated)

The SSH heredoc in `deploy.sh` performs:
1. Backs up current deploy to `/tmp/jimfolio-backup-TIMESTAMP`
2. Unpacks tarball into `/home/jimmy/jimfolio-monorepo`
3. Runs `npm ci --omit=dev` per app workspace
4. Runs `prisma generate` for `sweet-reach` and `veriflow`
5. Runs `pm2 reload ecosystem.config.js --update-env` (or `pm2 start` if first run)
6. Saves PM2 process list

### Post-deploy verification

```bash
ssh jimfolio 'pm2 list'
ssh jimfolio 'pm2 logs --lines 50'
```

Site live at: https://jimfolio.space
