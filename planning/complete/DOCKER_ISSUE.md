# Docker Build Issue - Tailwind CSS v4

## Problem

The Docker build is failing due to Tailwind CSS v4 (beta) compatibility issues with monorepos in Docker:

```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

## Root Cause

1. **Tailwind CSS v4** uses LightningCSS with native binaries
2. **Monorepo workspace structure** makes it hard for npm to resolve the native binary paths correctly in Docker
3. The native binary needs to be compiled for Linux but isn't being found during the build

## Solutions

### Option 1: Downgrade to Tailwind CSS v3 (Recommended for Production)

Tailwind v3 is stable and works perfectly in Docker:

```bash
cd apps/jimfolio
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3 postcss autoprefixer

# Update tailwind.config.js
npx tailwindcss init -p
```

Then update `globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Option 2: Wait for Tailwind CSS v4 Stable Release

Tailwind v4 is still in beta. Wait for the stable release which should have better Docker support.

### Option 3: Use Pre-built CSS (Workaround)

Build the CSS locally and copy it into Docker:

1. Build locally: `npm run build` (on Windows)
2. Copy `.next` folder into Docker
3. Skip the build step in Docker

## Current Status

- ✅ **Local builds work** (Windows with all tools installed)
- ✅ **Turborepo monorepo works**
- ❌ **Docker builds fail** due to Tailwind v4

## Recommendation

For immediate deployment, I recommend **Option 1** - downgrading to Tailwind v3 for the Docker build. You can keep v4 for local development if you want.

Would you like me to implement the downgrade to Tailwind v3?
