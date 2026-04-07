# Production Deployment Guide - Free Hosting

This guide will help you deploy the Bible Exhibition Registration system to production using **free hosting services**.

## Recommended Free Hosting Stack

- **Frontend/API**: Vercel (Free tier)
- **Database**: Supabase (Free tier)
- **Total Cost**: $0/month

## Prerequisites

1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Supabase account (sign up at supabase.com)

---

## Step 1: Setup Supabase Database (Free PostgreSQL)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project:
   - **Name**: bible-exhibition
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your location
4. Wait for project to be created (~2 minutes)

### 1.2 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of [`schema.sql`](schema.sql:1)
4. Click "Run" to execute
5. Verify tables were created in **Table Editor**

### 1.3 Get Database Connection String

1. Go to **Project Settings** → **Database**
2. Find **Connection string** → **URI**
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Save this - you'll need it for Vercel

---

## Step 2: Prepare Code for Deployment

### 2.1 Update Environment Variables

Create `.env.production` file:

```env
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# App Configuration (will be updated after Vercel deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_EXHIBITION_NAME=Bible Exhibition 2026

# Admin (change to a secure password)
ADMIN_PASSWORD=your-secure-password-here
```

### 2.2 Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Bible Exhibition Registration"

# Create GitHub repository and push
# Go to github.com and create a new repository
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/bible-exhibition-registration.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Click "Import"

### 3.2 Configure Environment Variables

In Vercel project settings, add these environment variables:

```
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
NEXT_PUBLIC_EXHIBITION_NAME = Bible Exhibition 2026
ADMIN_PASSWORD = your-secure-password-here
```

**Important**: After first deployment, update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL.

### 3.3 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (~2-3 minutes)
3. You'll get a URL like: `https://bible-exhibition-registration.vercel.app`

### 3.4 Update App URL

1. Go back to Vercel project settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. Redeploy the project (Vercel → Deployments → click "..." → Redeploy)

---

## Step 4: Test Production Deployment

### 4.1 Test Registration

1. Go to your Vercel URL: `https://your-app.vercel.app`
2. Click "Register"
3. Fill in the form and submit
4. You should see the confirmation page with QR code

### 4.2 Test QR Code

1. Scan the QR code with your phone
2. It should open: `https://your-app.vercel.app/api/qr/{token}`
3. You should see registration details

### 4.3 Test Check-in API

Use a tool like Postman or curl:

```bash
curl -X POST https://your-app.vercel.app/api/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-token-from-qr-code",
    "adminKey": "your-secure-password-here"
  }'
```

Should return:
```json
{
  "success": true,
  "alreadyCheckedIn": false,
  "registration": {...},
  "message": "Check-in successful"
}
```

---

## Step 5: Configure Your Mobile App

Update your mobile app with production URLs:

```javascript
// Production configuration
const SERVER_URL = 'https://your-app.vercel.app';
const ADMIN_KEY = 'your-secure-password-here';

// Use these in your API calls
fetch(`${SERVER_URL}/api/qr/${token}`)
fetch(`${SERVER_URL}/api/checkin`, {
  method: 'POST',
  body: JSON.stringify({ token, adminKey: ADMIN_KEY })
})
```

---

## Vercel Configuration Files

### vercel.json (Already configured)

The project is already configured for Vercel. No additional setup needed.

---

## Database Backup (Important!)

### Backup from Supabase

1. Go to Supabase dashboard
2. **Database** → **Backups**
3. Supabase automatically creates daily backups (free tier: 7 days retention)

### Manual Backup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Backup database
supabase db dump -f backup.sql
```

---

## Monitoring & Maintenance

### Vercel Dashboard

- **Analytics**: View traffic and performance
- **Logs**: Check for errors in Functions → Logs
- **Deployments**: View deployment history

### Supabase Dashboard

- **Table Editor**: View and edit data
- **SQL Editor**: Run queries
- **Database**: Monitor connections and performance
- **Logs**: Check database logs

---

## Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Check DATABASE_URL in Vercel environment variables
2. Verify Supabase database is running
3. Check if password is correct in connection string

### Issue: "QR code shows wrong URL"

**Solution:**
1. Update `NEXT_PUBLIC_APP_URL` in Vercel
2. Redeploy the application
3. Create a new registration to get updated QR code

### Issue: "Check-in API returns 401 Unauthorized"

**Solution:**
1. Verify `ADMIN_PASSWORD` in Vercel matches what you're using in mobile app
2. Check for extra spaces or quotes in password

### Issue: "Vercel deployment fails"

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Verify DATABASE_URL is set correctly

---

## Cost Breakdown (Free Tier Limits)

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ Limit: 100 GB bandwidth (plenty for this app)

### Supabase Free Tier
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Automatic backups (7 days)
- ⚠️ Limit: Database pauses after 1 week of inactivity (auto-resumes on access)

**Estimated Usage for Bible Exhibition:**
- Database: ~10 MB (thousands of registrations)
- Bandwidth: ~5 GB/month (moderate traffic)
- **Result**: Well within free tier limits ✅

---

## Security Checklist

Before going live:

- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Test all API endpoints
- [ ] Test QR code scanning
- [ ] Test check-in flow with mobile app
- [ ] Enable Supabase Row Level Security (optional)
- [ ] Set up Vercel password protection for admin panel (optional)

---

## Quick Deployment Checklist

1. [ ] Create Supabase project
2. [ ] Run schema.sql in Supabase SQL Editor
3. [ ] Get database connection string
4. [ ] Push code to GitHub
5. [ ] Connect GitHub to Vercel
6. [ ] Add environment variables in Vercel
7. [ ] Deploy
8. [ ] Update NEXT_PUBLIC_APP_URL with Vercel URL
9. [ ] Redeploy
10. [ ] Test registration and QR codes
11. [ ] Update mobile app with production URL
12. [ ] Test complete check-in flow

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## Alternative Free Hosting Options

If you prefer different services:

### Option 2: Railway + Supabase
- **Frontend/API**: Railway (Free tier: $5 credit/month)
- **Database**: Supabase (Free tier)

### Option 3: Render + Supabase
- **Frontend/API**: Render (Free tier)
- **Database**: Supabase (Free tier)

**Recommendation**: Stick with Vercel + Supabase for best performance and easiest setup.