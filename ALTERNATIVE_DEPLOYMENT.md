# Alternative Free Hosting Options

If Vercel isn't working, here are other **100% free** hosting options that are easier to set up.

## Option 1: Render (Recommended Alternative)

**Why Render:**
- ✅ Easier than Vercel
- ✅ Free tier: 750 hours/month
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL (no need for Supabase!)

### Deploy to Render (10 minutes)

#### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (easiest)

#### Step 2: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - **Name**: `bible-exhibition-db`
   - **Database**: `bible_exhibition`
   - **User**: `postgres`
   - **Region**: Choose closest to you
   - **Plan**: **Free** (select this!)
3. Click **"Create Database"**
4. Wait 2-3 minutes for database to be ready

#### Step 3: Initialize Database

1. In your database dashboard, click **"Connect"**
2. Copy the **"Internal Database URL"**
3. Click **"Shell"** tab
4. Paste and run this command:
   ```sql
   \i schema.sql
   ```
   Or copy-paste the entire contents of your `schema.sql` file

#### Step 4: Deploy Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in:
   - **Name**: `bible-exhibition`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

#### Step 5: Add Environment Variables

In the web service settings, add:

```
DATABASE_URL = [paste Internal Database URL from Step 3]
NEXT_PUBLIC_APP_URL = https://bible-exhibition.onrender.com
NEXT_PUBLIC_EXHIBITION_NAME = Bible Exhibition 2026
ADMIN_PASSWORD = your-secure-password
NODE_ENV = production
```

#### Step 6: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Your app will be live at: `https://bible-exhibition.onrender.com`

**Done!** 🎉

---

## Option 2: Railway (Also Easy)

**Why Railway:**
- ✅ Very simple setup
- ✅ Free tier: $5 credit/month
- ✅ One-click PostgreSQL
- ✅ Fast deployments

### Deploy to Railway (8 minutes)

#### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

#### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `bible-exhibition-registration` repository

#### Step 3: Add PostgreSQL

1. In your project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a database automatically

#### Step 4: Initialize Database

1. Click on the PostgreSQL service
2. Go to **"Data"** tab
3. Click **"Query"**
4. Copy-paste your entire `schema.sql` file
5. Click **"Run"**

#### Step 5: Configure Environment Variables

1. Click on your web service (not the database)
2. Go to **"Variables"** tab
3. Add these variables:

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_APP_URL = ${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_EXHIBITION_NAME = Bible Exhibition 2026
ADMIN_PASSWORD = your-secure-password
NODE_ENV = production
```

**Note**: Railway automatically fills in `DATABASE_URL` and `RAILWAY_PUBLIC_DOMAIN`

#### Step 6: Generate Domain

1. Go to **"Settings"** tab
2. Click **"Generate Domain"**
3. Your app will be live at: `https://your-app.up.railway.app`

**Done!** 🎉

---

## Option 3: Netlify + Supabase

**Why Netlify:**
- ✅ Very popular and reliable
- ✅ Free tier: 100GB bandwidth
- ✅ Easy to use
- ✅ Great for Next.js

### Deploy to Netlify (12 minutes)

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

This will open a browser window to authorize.

#### Step 3: Initialize Netlify

```bash
cd /Users/jayapritha/Documents/Projects/Personal/bible-exhibition-registration

netlify init
```

Follow the prompts:
- **Create & configure a new site**
- **Team**: Your team
- **Site name**: `bible-exhibition` (or leave blank for random)
- **Build command**: `npm run build`
- **Publish directory**: `.next`

#### Step 4: Add Environment Variables

```bash
netlify env:set DATABASE_URL "your-supabase-uri"
netlify env:set NEXT_PUBLIC_APP_URL "https://bible-exhibition.netlify.app"
netlify env:set NEXT_PUBLIC_EXHIBITION_NAME "Bible Exhibition 2026"
netlify env:set ADMIN_PASSWORD "your-secure-password"
```

#### Step 5: Deploy

```bash
netlify deploy --prod
```

Your app will be live at: `https://bible-exhibition.netlify.app`

**Done!** 🎉

---

## Comparison Table

| Feature | Render | Railway | Netlify | Vercel |
|---------|--------|---------|---------|--------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Free Database** | ✅ Built-in | ✅ Built-in | ❌ Need Supabase | ❌ Need Supabase |
| **Free Tier** | 750 hrs/mo | $5 credit/mo | 100GB/mo | 100GB/mo |
| **Speed** | Fast | Very Fast | Fast | Very Fast |
| **Best For** | All-in-one | Quick deploy | Static sites | Next.js apps |

**Recommendation**: Try **Render** first - it's the easiest and includes a free database!

---

## Troubleshooting

### Render Issues

**Issue: Build fails**
```bash
# Check build logs in Render dashboard
# Common fix: Update package.json scripts
```

**Issue: Database connection fails**
```bash
# Make sure you used "Internal Database URL" not "External"
# Check environment variables are set correctly
```

### Railway Issues

**Issue: Out of credits**
```bash
# Free tier gives $5/month
# Check usage in dashboard
# Optimize by reducing build frequency
```

**Issue: Domain not working**
```bash
# Make sure you generated a domain in Settings
# Wait 2-3 minutes for DNS propagation
```

### Netlify Issues

**Issue: API routes not working**
```bash
# Netlify needs special configuration for Next.js API routes
# Add netlify.toml file (see below)
```

---

## Netlify Configuration

If using Netlify, create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  node_bundler = "esbuild"
```

---

## Quick Start Commands

### Render
```bash
# No CLI needed - use web interface
# 1. Create account
# 2. Connect GitHub
# 3. Deploy
```

### Railway
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Netlify
```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify init
netlify deploy --prod
```

---

## Which One Should You Choose?

**Choose Render if:**
- ✅ You want the easiest setup
- ✅ You want built-in database
- ✅ You're new to deployment

**Choose Railway if:**
- ✅ You want fastest deployment
- ✅ You like modern UI
- ✅ You're okay with $5/month limit

**Choose Netlify if:**
- ✅ You're familiar with Netlify
- ✅ You already have Supabase set up
- ✅ You want maximum reliability

**Try Vercel again if:**
- ✅ You fixed the initial issue
- ✅ You want best Next.js integration
- ✅ You already have Supabase

---

## Need Help?

1. **Render Support**: https://render.com/docs
2. **Railway Support**: https://docs.railway.app
3. **Netlify Support**: https://docs.netlify.com

---

## Next Steps

1. Choose a platform (I recommend **Render**)
2. Follow the steps above
3. Test your deployment
4. Update your mobile app with the new URL

Good luck! 🚀