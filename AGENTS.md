# AGENTS.md — jimfolio-monorepo

## Status & Autonomy
- **Live status:** DEVELOPMENT (last confirmed with Jimmy: 2026-11-13)
- **Autonomy:** full — commit/push/PR/merge without asking when this repo's build/tests are green. If anything looks off → ask Jimmy.
- **Gates before merge:** `npm run build` (or workspace build for targeted changes).

## Deployment (Hetzner `apps-1` VPS + Caddy + Docker Compose)
All apps are self-hosted on `apps-1` (`jimmy@49.12.71.240:/home/jimmy/apps`) behind Caddy (`/home/jimmy/apps/Caddyfile`) and `/home/jimmy/apps/docker-compose.yml`.

### Next.js Standalone Apps (`jimfolio`, `chinahols`, `powerbi`, `wesplit`, `crema`, `pantry`, `fibr`)
1. Build locally:
   ```bash
   npm --workspace=@jimfolio/<app> run build
   ```
2. Copy static/public assets into the standalone bundle:
   ```bash
   cp -r apps/<app>/.next/static apps/<app>/.next/standalone/apps/<app>/.next/static
   [ -d apps/<app>/public ] && cp -r apps/<app>/public apps/<app>/.next/standalone/apps/<app>/public
   ```
3. Rsync standalone bundle to `apps-1` (exclude `data` and `.next/cache`, which are container-owned/mounted):
   ```bash
   rsync -az --delete --exclude data --exclude .next/cache \
     apps/<app>/.next/standalone/ jimmy@49.12.71.240:/home/jimmy/apps/<app>/
   ```
4. Restart the service and verify HTTP response:
   ```bash
   ssh jimmy@49.12.71.240 "cd /home/jimmy/apps && docker compose restart <app>"
   ```

### Static Sites (`standash`, `jacob-shooter`)
Sync static output directly into `/home/jimmy/apps/sites/<app>/` on `apps-1` (served by Caddy `file_server`).
