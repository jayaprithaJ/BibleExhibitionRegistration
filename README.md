# Bible Exhibition Registration System

A complete full-stack registration system for the Bible Exhibition (June 5-21, 2026) with intelligent slot allocation, date selection, and real-time capacity management.

## 🎯 Features

- ✅ **Date Selection** - Users choose their preferred exhibition date
- ✅ **Smart Slot Allocation** - Automatic assignment based on language preference
- ✅ **Consecutive Slots** - Mixed language groups get back-to-back time slots
- ✅ **Alternative Dates** - Suggests next available dates when preferred date is full
- ✅ **Admin Dashboard** - Real-time monitoring and schedule management
- ✅ **QR Code Check-in** - Secure two-step check-in system with mobile app integration
- ✅ **Public QR View** - Anyone can scan to view slot details (read-only)
- ✅ **Zero Cost** - Runs on free tiers (local or cloud)

## 📅 Exhibition Schedule

- **Dates**: June 5-21, 2026 (17 days)
- **Weekends**: 9 AM - 8 PM (Saturdays & Sundays)
- **Fridays**: 6 PM - 9 PM
- **Weekdays**: Initially closed, can be activated based on demand
- **Capacity**: 3,840 people (confirmed days)

## 🚀 Quick Start

### Prerequisites

1. **Install Node.js** (v20 or higher)
   ```bash
   # macOS
   brew install node
   
   # Or download from https://nodejs.org/
   ```

2. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Required for local PostgreSQL database

3. **Verify installations**
   ```bash
   node --version  # Should show v20.x.x or higher
   npm --version   # Should show v10.x.x or higher
   docker --version
   ```

### Installation

```bash
# 1. Navigate to project directory
cd /Users/jayapritha/Documents/Projects/Personal/bible-exhibition-registration

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start PostgreSQL database
docker-compose up -d

# 5. Wait for database to be ready (5 seconds)
sleep 5

# 6. Initialize database schema and slots
docker exec -i bible-exhibition-db psql -U postgres -d bible_exhibition < schema.sql

# 7. Start development server
npm run dev
```

### Access the Application

- **Registration Form**: http://localhost:3002/register
- **Admin Dashboard**: http://localhost:3002/admin
- **API Health**: http://localhost:3002/api/health

**Note**: App runs on port 3002 to avoid conflicts with other local apps.

## 📁 Project Structure

```
bible-exhibition-registration/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── register/route.ts     # Registration endpoint
│   │   ├── dates/                # Date availability endpoints
│   │   ├── admin/                # Admin endpoints
│   │   └── health/route.ts       # Health check
│   ├── register/page.tsx         # Registration form page
│   ├── confirmation/page.tsx     # Confirmation page
│   ├── admin/page.tsx            # Admin dashboard
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # UI primitives
│   ├── RegistrationForm.tsx      # Main registration form
│   ├── DatePicker.tsx            # Date selection component
│   └── AdminDashboard.tsx        # Admin interface
├── lib/                          # Core business logic
│   ├── db/                       # Database layer
│   │   ├── client.ts             # PostgreSQL connection
│   │   └── queries.ts            # Database queries
│   ├── allocation/               # Slot allocation
│   │   └── algorithm.ts          # Core allocation logic
│   ├── validation/               # Input validation
│   │   └── schemas.ts            # Zod schemas
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
├── docker-compose.yml            # PostgreSQL container
├── schema.sql                    # Database schema
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🧪 Testing Locally

### Test Scenario 1: Single Language Registration

```bash
# 1. Open http://localhost:3000/register
# 2. Fill form:
#    - Name: "John Doe"
#    - Church: "Grace Church"
#    - Date: Select June 7, 2026
#    - Total People: 5
#    - Tamil: 5, English: 0
# 3. Submit
# 4. Verify confirmation shows slot details
```

### Test Scenario 2: Mixed Language Registration

```bash
# 1. Fill form:
#    - Name: "Jane Smith"
#    - Church: "Hope Church"
#    - Date: June 7, 2026
#    - Total People: 10
#    - Tamil: 5, English: 5
# 2. Submit
# 3. Verify two consecutive slots (20 min apart)
```

### Test Scenario 3: Date Full - Alternative Dates

```bash
# 1. Register 660 people for June 7 (fill all slots)
# 2. Try to register for June 7 again
# 3. Verify alternative dates modal appears
# 4. Select alternative date
# 5. Verify registration succeeds
```

### Test Scenario 4: Admin Dashboard

```bash
# 1. Go to http://localhost:3000/admin
# 2. Enter password (from .env.local)
# 3. View registrations
# 4. Check capacity per date
# 5. Enable/disable dates
```

## 🗄️ Database Management

### View Database

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

# Exit
\q
```

### Reset Database

```bash
# Stop and remove database
docker-compose down -v

# Recreate and initialize
npm run db:setup
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:start      # Start database
npm run db:stop       # Stop database
npm run db:setup      # Setup database with schema
npm run db:reset      # Reset database (delete all data)
```

## 📊 API Endpoints

### POST /api/register
Register a new visitor group

**Request:**
```json
{
  "name": "John Doe",
  "churchName": "Grace Church",
  "preferredDate": "2026-06-07",
  "totalPeople": 10,
  "tamilCount": 5,
  "englishCount": 5,
  "phone": "+91 9876543210",
  "email": "john@example.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "registrationNumber": "BE-ABC123",
  "assignments": {
    "tamil": {
      "date": "2026-06-07",
      "time": "10:00",
      "peopleCount": 5
    },
    "english": {
      "date": "2026-06-07",
      "time": "10:20",
      "peopleCount": 5
    }
  },
  "waitTimeBetweenSlots": 20
}
```

### GET /api/dates/available
Get all available dates with capacity

### GET /api/dates/:date/availability
Check specific date availability

### GET /api/admin/registrations
Get all registrations (Admin only)

### GET /api/health
Health check endpoint

### POST /api/checkin
Check-in a registration (requires admin password)

**Request:**
```json
{
  "token": "qr-token-from-scan",
  "adminKey": "admin-password"
}
```

### GET /api/qr/:token
Get registration details from QR code (public, no auth)

## 🚀 Deployment

### Quick Deploy (10 minutes)

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step deployment to free hosting.

**Summary:**
1. Create Supabase project (free PostgreSQL)
2. Run schema.sql in Supabase
3. Push code to GitHub
4. Deploy to Vercel (free hosting)
5. Add environment variables
6. Done! 🎉

**Total Cost: $0/month**

### Option 1: Vercel + Supabase (Recommended)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Run schema.sql in SQL Editor
   - Get connection details

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   
   # Set environment variables in Vercel dashboard
   ```

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ADMIN_PASSWORD=your_secure_password
   ```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t bible-exhibition .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  bible-exhibition
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔒 Security

- ✅ Input validation with Zod
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (React built-in)
- ✅ Rate limiting (recommended for production)
- ✅ Environment variables for secrets
- ✅ Admin password protection

## 📈 Monitoring

### Local Development
- Check terminal logs
- View database with psql
- Monitor Docker logs: `docker logs bible-exhibition-db`

### Production
- Vercel Analytics (automatic)
- Supabase Dashboard
- Custom logging (implement as needed)

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Or use different port
npm run dev -- -p 3001
```

### Database connection failed
```bash
# Check if Docker is running
docker ps

# Restart database
docker-compose restart

# Check logs
docker logs bible-exhibition-db
```

### Slots not initialized
```bash
# Connect to database
docker exec -it bible-exhibition-db psql -U postgres -d bible_exhibition

# Run initialization
SELECT initialize_exhibition_slots();
```

## 📚 Documentation

### Setup & Deployment
- **[DEPLOY.md](./DEPLOY.md)** - Quick 10-minute deployment guide
- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Detailed production setup
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Local development setup
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide

### QR Code System
- **[MOBILE_APP_WORKFLOW.md](./MOBILE_APP_WORKFLOW.md)** - Two-step check-in workflow
- **[MOBILE_APP_INTEGRATION.md](./MOBILE_APP_INTEGRATION.md)** - Mobile app integration guide
- **[QR_SYSTEM_GUIDE.md](./QR_SYSTEM_GUIDE.md)** - Complete QR system documentation

### Requirements
- **[FINAL_REQUIREMENTS.md](./FINAL_REQUIREMENTS.md)** - Complete specifications

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review documentation files
3. Check database logs
4. Verify environment variables

## 📝 License

Private project for Bible Exhibition 2026

---

**Ready to start?** Follow the Quick Start section above! 🚀

**Need help?** Check SETUP_GUIDE.md for detailed instructions.