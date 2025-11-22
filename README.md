# Jimfolio Monorepo

A modern monorepo containing multiple Next.js applications with shared configurations and tooling.

## 🏗️ Structure

```
jimfolio-monorepo/
├── apps/
│   ├── jimfolio/          # Main portfolio website
│   └── sweet-reach/       # SweetReach demo application (with Prisma)
├── packages/
│   └── typescript-config/ # Shared TypeScript configurations
├── docker/
│   ├── jimfolio.Dockerfile
│   ├── sweet-reach.Dockerfile
│   └── sweet-reach-entrypoint.sh
├── nginx/                 # Reverse proxy configuration
├── sweet-reach-data/      # Persistent database storage
├── package.json           # Root workspace configuration
├── turbo.json            # Turborepo build configuration
└── docker-compose.yml    # Multi-container orchestration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.9.0
- npm >= 10.0.0

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run all apps in development mode**
   ```bash
   npm run dev
   ```

3. **Run specific app**
   ```bash
   cd apps/jimfolio
   npm run dev
   ```

4. **Build all apps**
   ```bash
   npm run build
   ```

## 📦 Applications

### Jimfolio (`apps/jimfolio`)

Main portfolio website built with Next.js 16 and Tailwind CSS v4.

- **URL**: http://localhost:3000 (local) | http://jimfolio.space (production)
- **Tech Stack**: Next.js 16, React 19, Tailwind CSS v4, Framer Motion

### Sweet Reach (`apps/sweet-reach`)

Demo application showcasing insight management with database persistence.

- **URL**: http://localhost:3001 (local) | http://demo.jimfolio.space (production)
- **Tech Stack**: Next.js 16, React 19, Prisma, SQLite, Recharts
- **Features**: Database-backed insights, taskings, reviews, and subscriptions

## 🛠️ Development

### Monorepo Commands

```bash
# Install dependencies for all workspaces
npm install

# Build all apps
npm run build

# Run all apps in dev mode
npm run dev

# Lint all apps
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

### Working with Prisma (Sweet Reach)

```bash
cd apps/sweet-reach

# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## 📝 Adding New Apps

1. Create new app directory:
   ```bash
   mkdir -p apps/my-new-app
   cd apps/my-new-app
   ```

2. Initialize Next.js app:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app
   ```

3. Update `package.json`:
   ```json
   {
     "name": "@jimfolio/my-new-app",
     "private": true
   }
   ```

4. Update `tsconfig.json`:
   ```json
   {
     "extends": "@jimfolio/typescript-config/nextjs.json"
   }
   ```

5. Add to root `package.json` workspaces (already configured via `apps/*`)

6. Install dependencies from root:
   ```bash
   npm install
   ```

## 🔧 Shared Packages

### TypeScript Config (`@jimfolio/typescript-config`)

Provides shared TypeScript configurations:

- `base.json`: Base configuration
- `nextjs.json`: Next.js-specific settings
- `react.json`: React-specific settings

Usage in apps:
```json
{
  "extends": "@jimfolio/typescript-config/nextjs.json"
}
```

## 🚢 Deployment

### VPS Deployment

We use PM2 and Nginx for a simple, robust deployment without Docker.

👉 **[Read the Full Deployment Guide (DEPLOY.md)](./DEPLOY.md)**

### Quick Summary
1. **Clone** the repo on your VPS.
2. **Install** Node.js 20, PM2, and Nginx.
3. **Build** the apps (`npm install && npm run build`).
4. **Start** with PM2 (`pm2 start ecosystem.config.js`).
5. **Configure Nginx** using the provided `deploy/nginx.conf`.

## 📚 Tech Stack

- **Build System**: Turborepo
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v3
- **Database**: Prisma + SQLite
- **Deployment**: PM2, Nginx
- **OS**: Ubuntu (VPS)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run build`
4. Submit a pull request

## 📄 License

Private - All rights reserved

## 🐛 Troubleshooting

### Database not initializing

```bash
# Remove old database
rm apps/sweet-reach/prisma/dev.db

# Restart PM2 process
pm2 restart sweet-reach
```

### Build fails with "Cannot find module"

```bash
# Clean and reinstall
rm -rf node_modules apps/*/node_modules
npm install
```

### Port already in use

```bash
# Check what's using the port
lsof -i :3000

# Kill the process or change port in ecosystem.config.js
```

## 📞 Support

For issues or questions, please open an issue on GitHub.
