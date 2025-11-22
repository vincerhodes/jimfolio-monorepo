# Static Demo Deployment to Netlify (SQLite)

## Overview
This approach uses a pre-built SQLite database committed to the repository.
Perfect for **read-only demos** where users browse data but don't modify it.

## ✅ Advantages
- No external database needed
- No environment variables to configure
- Instant deployment
- Completely free
- Data persists in your repo

## ⚠️ Limitations
- **Read-only**: Users can't submit new insights (forms won't persist)
- Database updates require redeployment
- Not suitable for production apps

## Deployment Steps

### Step 1: Build Database Locally

```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma migrate dev --name init

# Seed with demo data
npx prisma db seed
```

This creates `prisma/dev.db` with all your demo data.

### Step 2: Verify Database

```bash
# Test locally
npm run dev

# Visit http://localhost:3000
# Browse insights, dashboard, reports - all should work!
```

### Step 3: Commit Database to Git

```bash
# The .gitignore is already configured to allow prisma/dev.db
git add .
git commit -m "Add pre-built SQLite database for static demo"
git push origin main
```

### Step 4: Deploy to Netlify

#### Option A: Netlify CLI (Quick)

```bash
# Login
netlify login

# Initialize (first time only)
netlify init
# Choose: Create & configure a new site
# Site name: sweetreach-demo (or your choice)
# Build command: npm run build
# Publish directory: .next

# Deploy
netlify deploy --prod
```

#### Option B: Netlify Dashboard

1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click "Deploy site"

### Step 5: Done! 🎉

Your site will be live at: `https://your-site-name.netlify.app`

## What Works in This Demo

✅ **Browse insights** - All data is visible
✅ **Dashboard** - Charts and stats work
✅ **Action tracking** - Reports display correctly
✅ **Filters & search** - All filtering works
✅ **Digest preview** - Email preview works
✅ **Walkthrough** - Interactive guide works

## What Doesn't Work (Expected)

❌ **Submitting new insights** - Forms won't persist data
❌ **Adding reviews** - Manager reviews won't save
❌ **Feedback submission** - Feedback forms won't save
❌ **Subscription changes** - Toggle won't persist

## For Your Demo Presentation

**Tell your boss:**
> "This is a static demo showcasing the UI and data visualization. 
> The production version would use a live database where all forms 
> would work in real-time. For this demo, you can browse all the 
> pre-loaded insights, reports, and dashboards."

## Updating Demo Data

If you need to change the demo data:

```bash
# 1. Modify prisma/seed.js
# 2. Rebuild database
rm prisma/dev.db
npx prisma migrate dev --name init
npx prisma db seed

# 3. Test locally
npm run dev

# 4. Commit and redeploy
git add prisma/dev.db
git commit -m "Update demo data"
git push origin main

# Netlify will auto-deploy if connected to GitHub
# Or manually: netlify deploy --prod
```

## Troubleshooting

### "Database not found" error
- Make sure `prisma/dev.db` exists and is committed
- Check that `.gitignore` allows `!prisma/dev.db`

### Forms don't work
- **Expected behavior** for static demo
- Data is read-only from the pre-built database

### Need to make it fully functional?
- Switch to PostgreSQL (Neon, Railway, etc.)
- Follow `FREE_DB_OPTIONS.md` guide
- Add environment variables to Netlify

## Quick Commands Reference

```bash
# Rebuild database
rm prisma/dev.db
npx prisma migrate dev --name init
npx prisma db seed

# Test locally
npm run dev

# Deploy
netlify deploy --prod

# View site
netlify open:site
```

---

**Perfect for**: Quick demos, presentations, showcasing UI/UX
**Not for**: Production apps, user-generated content, real-time updates
