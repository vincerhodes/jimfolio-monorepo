---
description: Deploy jimfolio monorepo to VPS (commit, push, build, tarball, transfer, restart PM2)
---

## Deploy Jimfolio Monorepo to Production VPS

**Strategy**: git push locally → SSH into VPS → git pull + build on VPS.
No tarball SCP (avoids stalls on slow connections).

Steps:
1. Commits all outstanding changes and pushes the current branch to GitHub
2. SSHs into VPS: git pull, full `npm ci`, sequential Prisma+build for each
   Prisma app, then builds remaining apps, sets up runtime node_modules, reloads PM2

### Prerequisites
- SSH alias `jimfolio` must be configured in `~/.ssh/config` (host `66.42.115.185`, user `jimmy`)
- SSH key must be present on the server (`~/.ssh/authorized_keys`)
- PM2 startup configured as `pm2-jimmy` systemd service
- Node 20+ and npm 10+ on VPS
- `.env` files must exist on VPS for Prisma apps:
  - `apps/sweet-reach/.env` → `DATABASE_URL="file:/home/jimmy/jimfolio-monorepo/apps/sweet-reach/sweet-reach-data/db.sqlite"`
  - `apps/veriflow/.env` → copy of `apps/veriflow/.env.production`

### Standard deploy

```bash
bash deploy/deploy.sh
```

Optional flags:

```bash
# Custom commit message
bash deploy/deploy.sh --message "feat: update portfolio hero section"

# Skip git commit/push (e.g. already pushed manually)
bash deploy/deploy.sh --skip-git
```

### VPS remote steps (automated)

The SSH heredoc in `deploy.sh` performs:
1. `git pull origin main`
2. `npm ci` (full deps including devDeps, needed for build)
3. **sweet-reach**: `prisma generate` → `turbo build --filter=@jimfolio/sweet-reach`
4. **veriflow**: `prisma generate` → `turbo build --filter=@jimfolio/veriflow`
   *(veriflow's generate overwrites root `@prisma/client`, but sweet-reach is already built)*
5. `turbo build` for all other apps (uses Turbo cache, skips unchanged)
6. Runtime isolation: `npm ci --omit=dev` in `apps/sweet-reach` + `prisma generate` (isolated local client)
7. `prisma generate` for veriflow in root node_modules (runtime client)
8. `pm2 reload ecosystem.config.js --update-env` (or `pm2 start` on first run)
9. `pm2 save`

### Prisma isolation (important)

`sweet-reach` and `veriflow` both use Prisma with different schemas and both write
to the same root `node_modules/@prisma/client`. To avoid TypeScript conflicts:
- Build sweet-reach **first** (with its Prisma client active in root node_modules)
- Then generate veriflow's client (overwrites root), build veriflow
- After build: `npm ci --omit=dev` in `apps/sweet-reach` gives it its own local
  `node_modules/@prisma/client` for runtime isolation

### First-time VPS setup (fresh server)

After running `deploy/bootstrap-vps.sh`, you also need to seed the databases once:

```bash
ssh jimfolio
cd jimfolio-monorepo

# sweet-reach
DATABASE_URL="file:/home/jimmy/jimfolio-monorepo/apps/sweet-reach/sweet-reach-data/db.sqlite" \
  npx prisma migrate deploy --schema=apps/sweet-reach/prisma/schema.prisma
cd apps/sweet-reach && DATABASE_URL="..." node prisma/seed.js && cd ../..

# veriflow
cp apps/veriflow/.env.production apps/veriflow/.env
cd apps/veriflow && npx prisma migrate deploy && node prisma/seed.js
```

### Post-deploy verification

```bash
ssh jimfolio 'pm2 list'
ssh jimfolio 'pm2 logs --lines 50'
curl -I https://jimfolio.space
curl -I https://jimfolio.space/sweet-reach
curl -I https://jimfolio.space/veriflow
```

Site live at: https://jimfolio.space
