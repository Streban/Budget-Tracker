# Deployment Instructions - Fixing Data Persistence on Vercel

## The Problem
Your budget tracker works locally but loses data on Vercel because **Vercel's serverless functions have read-only file systems**. JSON files can't be written persistently.

## The Solution: Vercel KV (Redis)
We've updated your app to use **Vercel KV** (Redis-based storage) in production while keeping JSON files for local development.

## Setup Steps

### 1. Set Up Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Choose a name (e.g., `budget-tracker-kv`)
7. Select region closest to your users
8. Click **Create**

### 2. Connect KV to Your Project

1. In the KV database dashboard, click **Connect Project**
2. Select your budget tracker project
3. Choose **All Environments** or just **Production**
4. Click **Connect**

This automatically adds the required environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### 3. Deploy Your Updated Code

```bash
# Commit your changes
git add .
git commit -m "Add Vercel KV support for data persistence"
git push origin main
```

Vercel will automatically deploy your changes.

### 4. Migrate Your Existing Data

After deployment, run this **once** to transfer your existing data:

```bash
# Make a POST request to your migration endpoint
curl -X POST https://your-app-name.vercel.app/api/migrate
```

Or visit `https://your-app-name.vercel.app/api/migrate` in your browser and make a POST request.

## How It Works Now

### Development (Local)
- ✅ Uses JSON files in `/data` directory
- ✅ Fast and simple for development
- ✅ No external dependencies

### Production (Vercel)
- ✅ Uses Vercel KV (Redis) for persistent storage
- ✅ Data survives deployments and serverless restarts
- ✅ Fast global access
- ✅ Automatic scaling

## Code Changes Made

1. **Updated all API routes** (`app/api/data/*/route.ts`):
   - Production: Uses Vercel KV
   - Development: Uses JSON files

2. **Added migration endpoint** (`app/api/migrate/route.ts`):
   - Transfers existing JSON data to KV
   - Run once after KV setup

3. **Installed dependencies**:
   - `@vercel/kv` package for Redis access

## Verification

After deployment and migration:

1. **Test data persistence**:
   - Add/edit some data in your app
   - Refresh the page
   - Data should persist ✅

2. **Check migration results**:
   - Visit `/api/migrate` to see migration status
   - Should show successful transfer of all data types

## Troubleshooting

### KV Not Working?
- Check environment variables are set in Vercel dashboard
- Verify KV database is connected to your project
- Check deployment logs for KV connection errors

### Migration Failed?
- Ensure JSON files exist in `/data` directory
- Check file permissions and format
- Review migration logs in Vercel Functions tab

### Data Still Lost?
- Verify you're testing in production (not preview)
- Check that `NODE_ENV=production` in Vercel
- Confirm KV calls are working in function logs

## Cost
- Vercel KV has a generous free tier
- Your budget tracker data usage will likely stay within free limits
- Monitor usage in Vercel dashboard

## Alternative Solutions

If you prefer not to use Vercel KV:

1. **Supabase** (PostgreSQL)
2. **PlanetScale** (MySQL)
3. **MongoDB Atlas**
4. **Upstash Redis**

All would require similar API route modifications. 