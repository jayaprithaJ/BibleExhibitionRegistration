# Quick Deployment Guide

## 🚀 Deploy in 10 Minutes

### Step 1: Setup Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign up/Login
2. Click "New Project"
3. Fill in:
   - **Name**: `bible-exhibition`
   - **Database Password**: (create a strong password and save it)
   - **Region**: Choose closest to you
4. Wait for project creation (~2 min)

### Step 2: Setup Database (1 minute)

1. In Supabase dashboard → **SQL Editor**
2. Click "New query"
3. Copy entire [`schema.sql`](schema.sql:1) file content
4. Paste and click "Run"
5. Verify in **Table Editor** that tables were created

### Step 3: Get Database URL (1 minute)

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the URL (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Save this URL - you'll need it next

### Step 4: Deploy to Vercel (3 minutes)

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/bible-exhibition.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → Sign up/Login
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Add Environment Variables:
   ```
   DATABASE_URL = (paste your Supabase URL)
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   NEXT_PUBLIC_EXHIBITION_NAME = Bible Exhibition 2026
   ADMIN_PASSWORD = (create a secure password)
   ```
6. Click "Deploy"

### Step 5: Update App URL (2 minutes)

1. After deployment, copy your Vercel URL (e.g., `https://bible-exhibition-abc123.vercel.app`)
2. Go to Vercel → Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` with your actual URL
4. Go to Deployments → Click "..." → "Redeploy"

### Step 6: Test (1 minute)

1. Visit your Vercel URL
2. Click "Register" and create a test registration
3. Scan the QR code with your phone
4. Verify it shows registration details

## ✅ Done!

Your app is now live at: `https://your-app.vercel.app`

## 📱 Update Mobile App

Update your mobile app configuration:

```javascript
const SERVER_URL = 'https://your-app.vercel.app';
const ADMIN_KEY = 'your-admin-password';
```

## 🔧 Troubleshooting

**Issue: Database connection error**
- Verify DATABASE_URL in Vercel environment variables
- Check password in connection string

**Issue: QR code shows wrong URL**
- Update NEXT_PUBLIC_APP_URL in Vercel
- Redeploy the application

**Issue: Check-in returns "Unauthorized"**
- Verify ADMIN_PASSWORD matches in Vercel and mobile app

## 📚 Full Documentation

See [`PRODUCTION_DEPLOYMENT.md`](PRODUCTION_DEPLOYMENT.md:1) for detailed instructions.

## 💰 Cost

**Total: $0/month** (Free tier)
- Vercel: Free (100 GB bandwidth)
- Supabase: Free (500 MB database)