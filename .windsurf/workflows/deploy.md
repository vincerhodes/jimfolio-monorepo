---
description: Deploy jimfolio monorepo to VPS (commit, push, build, tarball, transfer, restart PM2)
---

## Deploy Jimfolio Monorepo to Production VPS

Runs the full deployment pipeline:
1. Optionally commits all outstanding changes and pushes the current branch to GitHub
2. Builds all apps via Turbo (`npm run build`) unless `--skip-build` is used
3. Packages the current local workspace into a tarball (source + build artefacts, no `node_modules`)
4. Waits for SSH to become available if the VPS is still booting, then SCPs the tarball to `jimfolio:/tmp/jimfolio-deploy.tar.gz`
5. Waits again if needed, then SSHs into the VPS, unpacks, installs production deps, installs `typescript --no-save` so Next.js can load `next.config.ts`, regenerates Prisma clients, and reloads or starts PM2

### Prerequisites
- SSH alias `jimfolio` must be configured in `~/.ssh/config` (current host `66.42.115.185`, user `jimmy`)
- SSH key must be present on the server (`~/.ssh/authorized_keys`)
- PM2 must be running on the VPS with the monorepo's `ecosystem.config.js`
- Node 20+ and npm 10+ on both local machine and VPS

### Standard deploy

The script resolves the repo root automatically, so it can be run from the repo root or via an absolute path from elsewhere.

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

Efficiency notes:

- Use `--skip-git` when the branch is already pushed or when you intentionally want to deploy the current local workspace state without creating a deployment commit.
- Use `--skip-build` only if the local build artefacts are definitely fresh, because the tarball includes the local `.next/` and other build outputs.
- The slowest part of the deploy is usually the remote `npm ci` work. Seeing several minutes of dependency installation output is normal.
- If the VPS is rebooting, the script now waits and retries SSH automatically instead of failing immediately on `pam_nologin`.

### What gets packaged in the tarball

Included:
- All source files from the current local workspace
- `.next/` and other local build artefacts produced before packing
- `ecosystem.config.js`, `package.json`, `package-lock.json`, `turbo.json`
- `deploy/` directory (including `deploy.sh` itself)

Excluded:
- `node_modules/` (all levels — reinstalled on VPS)
- `.git/`, `.turbo/` cache
- `.next/cache/` (unnecessary artefact cache)
- `apps/veriflow/prisma/production.db`
- `apps/sweet-reach/sweet-reach-data`
- `*.log` files

### VPS remote steps (automated)

The SSH heredoc in `deploy.sh` performs:
1. Backs up source files to `/tmp/jimfolio-backup-TIMESTAMP` (excludes `node_modules`/`.next` for speed)
2. Unpacks tarball into `/home/jimmy/jimfolio-monorepo`
3. Removes the existing root `node_modules/` directory to avoid stale-install `ENOTEMPTY` issues
4. Runs `npm ci --omit=dev` from repo root (installs all workspace deps via root lock file)
5. Runs `npm install typescript --no-save` from repo root so Next.js 16 can load `next.config.ts` on the VPS
6. Removes app-level `node_modules/` before running app-specific installs
7. Runs `npm ci --omit=dev` inside `apps/jimfolio` and `apps/sweet-reach` (they have their own lock files)
8. Runs `prisma generate` for `sweet-reach` and `veriflow` on a best-effort basis
9. Runs `pm2 reload ecosystem.config.js --update-env` (or `pm2 start` if this is the first run)
10. Saves PM2 process list, removes the uploaded tarball, and prints `pm2 list`

Expected non-fatal output:

- `npm warn Unknown builtin config "globalignorefile"`
- `npm warn deprecated ...`
- `npm audit` summary output after installs

### Post-deploy verification

```bash
ssh jimfolio 'pm2 list'
ssh jimfolio 'pm2 logs --lines 50'
curl -I https://jimfolio.space/chinahols
```

Site live at: https://jimfolio.space
