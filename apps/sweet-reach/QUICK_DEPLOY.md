# Quick Netlify Deployment via CLI

## Step 1: Install Netlify CLI (if not already installed)
```bash
npm install -g netlify-cli
```

## Step 2: Set Up Database First (REQUIRED)

### Get Free PostgreSQL from Supabase:
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Set name: `sweetreach-demo`
4. Set a strong password (save it!)
5. Choose region closest to you
6. Wait ~2 minutes for setup

7. Go to **Settings** → **Database** → **Connection String**
8. Copy **Connection pooling** URL (port 6543) - this is `DATABASE_URL`
9. Copy **Direct connection** URL (port 5432) - this is `DIRECT_URL`

## Step 3: Create Local .env File

Create `.env` in project root:
```
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## Step 4: Initialize Database Locally

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## Step 5: Deploy to Netlify

```bash
# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# When prompted:
# - Create & configure a new site
# - Team: Choose your team
# - Site name: sweetreach-demo (or your preferred name)
# - Build command: npm run build
# - Directory to deploy: .next
# - Netlify functions folder: (leave empty, press Enter)

# Deploy
netlify deploy --prod
```

## Step 6: Add Environment Variables in Netlify

After deployment, add environment variables:

```bash
netlify env:set DATABASE_URL "your-connection-pooling-url"
netlify env:set DIRECT_URL "your-direct-connection-url"
```

Or add them via Netlify dashboard:
1. Go to your site in Netlify dashboard
2. **Site settings** → **Environment variables**
3. Add both `DATABASE_URL` and `DIRECT_URL`

## Step 7: Redeploy with Environment Variables

```bash
netlify deploy --prod
```

## Alternative: Deploy via Netlify Dashboard

If CLI doesn't work, you can:
1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub repo
5. Set build command: `npm run build`
6. Set publish directory: `.next`
7. Add environment variables before deploying
8. Click "Deploy site"

## Your Site Will Be Live At:
`https://sweetreach-demo.netlify.app` (or your chosen subdomain)

## Verify Deployment:
- Visit `/walkthrough` for the demo guide
- Check `/` for dashboard
- Test `/insights/new` to submit an insight

🚀 Ready to present!
