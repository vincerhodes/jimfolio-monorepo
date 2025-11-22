# Netlify Deployment Guide for SweetReach Demo

## Prerequisites
1. GitHub account
2. Netlify account (free tier works)
3. Supabase account (free tier works) OR any PostgreSQL database

## Step 1: Set Up PostgreSQL Database

### Option A: Supabase (Recommended - Free & Easy)
1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: sweetreach-demo
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
4. Wait for project to initialize (~2 minutes)
5. Go to **Project Settings** → **Database**
6. Copy both connection strings:
   - **Connection pooling** (port 6543) → This is your `DATABASE_URL`
   - **Direct connection** (port 5432) → This is your `DIRECT_URL`

### Option B: Other PostgreSQL Providers
- Neon (https://neon.tech) - Free tier available
- Railway (https://railway.app) - Free tier available
- ElephantSQL (https://www.elephantsql.com) - Free tier available

## Step 2: Prepare Your Repository

1. **Create `.env` file locally** (for testing):
```bash
DATABASE_URL="your-connection-pooling-url-here"
DIRECT_URL="your-direct-connection-url-here"
```

2. **Install dependencies and migrate database**:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

3. **Test locally**:
```bash
npm run dev
```
Visit http://localhost:3000 to verify everything works.

4. **Commit and push to GitHub**:
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

## Step 3: Deploy to Netlify

1. Go to https://netlify.com and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your `sweet-reach-demo` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: (leave empty)

6. **Add environment variables** (IMPORTANT):
   Click **"Show advanced"** → **"New variable"**
   
   Add these two variables:
   - **Key**: `DATABASE_URL`  
     **Value**: Your connection pooling URL from Supabase
   
   - **Key**: `DIRECT_URL`  
     **Value**: Your direct connection URL from Supabase

7. Click **"Deploy site"**

## Step 4: Run Database Migrations on Netlify

After first deployment:

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Verify both `DATABASE_URL` and `DIRECT_URL` are set
3. Go to **Deploys** → Click **"Trigger deploy"** → **"Clear cache and deploy site"**

Alternatively, run migrations locally (they'll apply to the cloud database):
```bash
npx prisma migrate deploy
npx prisma db seed
```

## Step 5: Access Your Demo

1. Netlify will provide a URL like: `https://your-site-name.netlify.app`
2. You can customize this in **Site settings** → **Domain management**
3. Share this URL with your boss for the demo!

## Troubleshooting

### Build fails with "Can't reach database server"
- Check that `DATABASE_URL` and `DIRECT_URL` are correctly set in Netlify environment variables
- Ensure your database is accessible (not paused/sleeping)

### "No data showing" after deployment
- Run the seed script: `npx prisma db seed` (with your `.env` file configured)
- Or manually run migrations in Netlify by triggering a new deploy

### Pages show errors
- Check Netlify function logs: **Deploys** → Click on latest deploy → **Function logs**
- Verify all environment variables are set correctly

## Quick Reference Commands

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed

# View database in browser
npx prisma studio

# Build for production
npm run build

# Test production build locally
npm start
```

## Notes

- The free Supabase tier includes 500MB database storage (plenty for this demo)
- Netlify free tier includes 100GB bandwidth/month
- Database persists between deployments ✅
- You can update the app by pushing to GitHub - Netlify auto-deploys

## Demo Walkthrough for Your Boss

Once deployed, guide them to:
1. Start at `/walkthrough` - comprehensive overview
2. Browse insights at `/insights`
3. Submit a new insight at `/insights/new`
4. View dashboard at `/` (home)
5. Check action tracking at `/report`
6. See email digest preview at `/email-preview`

Good luck with your demo! 🚀
