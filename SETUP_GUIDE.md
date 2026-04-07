# Setup Guide - Bible Exhibition Registration System

## Prerequisites Installation

### 1. Install Node.js and npm

**For macOS:**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node

# Verify installation
node --version  # Should show v20.x.x or higher
npm --version   # Should show v10.x.x or higher
```

**Alternative - Download from official website:**
- Visit: https://nodejs.org/
- Download LTS version (v20.x.x)
- Run installer
- Verify: `node --version && npm --version`

### 2. Install Docker Desktop (for local database)

**For macOS:**
- Download from: https://www.docker.com/products/docker-desktop
- Install Docker Desktop
- Start Docker Desktop
- Verify: `docker --version`

---

## Project Setup

### Step 1: Initialize Next.js Project

```bash
cd /Users/jayapritha/Documents/Projects/Personal/bible-exhibition-registration

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm

# Answer prompts:
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? No
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? Yes (@/*)
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
npm install qrcode.react
npm install sonner

# UI Components (shadcn/ui)
npm install @radix-ui/react-dialog
npm install @radix-ui/react-select
npm install @radix-ui/react-label
npm install @radix-ui/react-slot
npm install lucide-react
npm install class-variance-authority
npm install clsx tailwind-merge

# Database (for local development)
npm install pg
npm install -D @types/pg

# Development dependencies
npm install -D @types/node
npm install -D @types/react
npm install -D @types/react-dom
```

### Step 3: Set Up Local Database with Docker

```bash
# Create docker-compose.yml (already created in project)
# Start PostgreSQL database
docker-compose up -d

# Verify database is running
docker ps

# Connect to database
docker exec -it bible-exhibition-db psql -U postgres -d bible_exhibition

# Run schema (copy from schema.sql file)
\i schema.sql

# Exit
\q
```

### Step 4: Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values
# For local development, use:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bible_exhibition
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Run Development Server

```bash
# Start the development server
npm run dev

# Open browser
# Visit: http://localhost:3000
```

---

## Local Testing Workflow

### 1. Start Services

```bash
# Terminal 1: Start database
docker-compose up

# Terminal 2: Start Next.js dev server
npm run dev
```

### 2. Access Application

- **Registration Form**: http://localhost:3000/register
- **Admin Dashboard**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/health

### 3. Test Scenarios

#### Scenario 1: Single Language Registration
1. Go to http://localhost:3000/register
2. Fill form:
   - Name: "John Doe"
   - Church: "Grace Church"
   - Select Date: June 7, 2026
   - Total People: 5
   - Tamil: 5, English: 0
3. Submit
4. Verify confirmation page shows slot details

#### Scenario 2: Mixed Language Registration
1. Fill form:
   - Name: "Jane Smith"
   - Church: "Hope Church"
   - Select Date: June 7, 2026
   - Total People: 10
   - Tamil: 5, English: 5
3. Submit
4. Verify two consecutive slots are assigned

#### Scenario 3: Date Full - Alternative Dates
1. Fill all slots for June 7 (register 660 people)
2. Try to register for June 7
3. Verify alternative dates modal appears
4. Select alternative date
5. Verify registration succeeds

#### Scenario 4: Admin Dashboard
1. Go to http://localhost:3000/admin
2. Enter password (from .env.local)
3. View registrations
4. Check capacity per date
5. Enable/disable dates

### 4. Database Inspection

```bash
# Connect to database
docker exec -it bible-exhibition-db psql -U postgres -d bible_exhibition

# Check registrations
SELECT * FROM registrations ORDER BY created_at DESC LIMIT 10;

# Check slot capacity
SELECT slot_date, language, 
       COUNT(*) as total_slots,
       SUM(filled) as total_filled,
       SUM(capacity - filled) as available
FROM slots
GROUP BY slot_date, language
ORDER BY slot_date;

# Check schedule
SELECT * FROM exhibition_schedule WHERE is_active = true;
```

---

## Troubleshooting

### Issue: Port 3000 already in use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
npm run dev -- -p 3001
```

### Issue: Database connection failed
```bash
# Check if Docker is running
docker ps

# Restart database
docker-compose down
docker-compose up -d

# Check logs
docker logs bible-exhibition-db
```

### Issue: Database schema not created
```bash
# Connect to database
docker exec -it bible-exhibition-db psql -U postgres -d bible_exhibition

# Run schema manually
\i schema.sql

# Or run from command line
docker exec -i bible-exhibition-db psql -U postgres -d bible_exhibition < schema.sql
```

### Issue: Slots not initialized
```bash
# Connect to database
docker exec -it bible-exhibition-db psql -U postgres -d bible_exhibition

# Run initialization function
SELECT initialize_exhibition_slots();
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code (if prettier is set up)
npm run format

# Database commands
docker-compose up -d          # Start database
docker-compose down           # Stop database
docker-compose logs -f        # View logs
docker-compose restart        # Restart database
```

---

## Project Structure

```
bible-exhibition-registration/
├── app/
│   ├── api/
│   │   ├── register/route.ts
│   │   ├── dates/
│   │   │   ├── available/route.ts
│   │   │   └── [date]/availability/route.ts
│   │   ├── admin/
│   │   │   ├── schedule/route.ts
│   │   │   └── registrations/route.ts
│   │   └── health/route.ts
│   ├── register/page.tsx
│   ├── confirmation/page.tsx
│   ├── admin/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── dialog.tsx
│   ├── RegistrationForm.tsx
│   ├── DatePicker.tsx
│   ├── AlternativeDatesModal.tsx
│   └── AdminDashboard.tsx
├── lib/
│   ├── db/
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── allocation/
│   │   ├── algorithm.ts
│   │   └── helpers.ts
│   ├── validation/
│   │   └── schemas.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── public/
├── docker-compose.yml
├── schema.sql
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## Next Steps After Setup

1. ✅ Install Node.js and Docker
2. ✅ Initialize project
3. ✅ Start local database
4. ✅ Run development server
5. ✅ Test registration flow
6. ✅ Test admin dashboard
7. ✅ Review and adjust as needed
8. 🚀 Deploy to production (see DEPLOYMENT.md)

---

## Quick Start (After Prerequisites)

```bash
# One-time setup
npm install
docker-compose up -d
docker exec -i bible-exhibition-db psql -U postgres -d bible_exhibition < schema.sql

# Daily development
docker-compose up -d  # Start database
npm run dev           # Start app

# Access
# App: http://localhost:3000
# Admin: http://localhost:3000/admin
```

---

**Need Help?** Check FINAL_REQUIREMENTS.md for detailed specifications.