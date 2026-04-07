# Quick Start Guide - Bible Exhibition Registration System

## 📋 Project Summary

**What**: Digital registration system for Bible Exhibition  
**When**: June 5-21, 2026  
**Where**: Hosted on Vercel (free)  
**Cost**: $0/month  

---

## 🎯 Key Features

1. **Date Selection** - Users choose their preferred date
2. **Smart Slot Allocation** - Automatic slot assignment based on language preference
3. **Alternative Dates** - Suggests next available dates if preferred date is full
4. **Admin Dashboard** - Real-time monitoring and schedule management
5. **QR Code Access** - Easy mobile registration

---

## 📅 Exhibition Schedule

### Operating Days
- **Saturdays**: Jun 7, 14, 21 (9 AM - 8 PM) - 660 capacity each
- **Sundays**: Jun 8, 15 (9 AM - 8 PM) - 660 capacity each  
- **Fridays**: Jun 6, 13, 20 (6 PM - 9 PM) - 180 capacity each
- **Weekdays**: Initially closed, can be activated based on demand

### Total Capacity
- **Confirmed**: 3,840 people (8 days)
- **Potential**: 9,240 people (if weekdays open)

---

## 🚀 Implementation Steps

### 1. Setup (Days 1-2)
```bash
# Create project
npx create-next-app@latest bible-exhibition-registration --typescript --tailwind --app

# Install dependencies
npm install @supabase/supabase-js react-hook-form zod date-fns qrcode.react

# Create Supabase account and project
# Copy database schema from FINAL_REQUIREMENTS.md
# Run SQL to create tables and initialize slots
```

### 2. Core Development (Days 3-8)
- Build registration form with date picker
- Implement slot allocation algorithm
- Create API routes
- Add validation and error handling

### 3. Admin & Testing (Days 9-12)
- Build admin dashboard
- Add schedule management
- Perform load testing
- Fix bugs

### 4. Deployment (Days 13-14)
- Deploy to Vercel
- Generate QR code
- Final testing
- Documentation

---

## 📁 Key Files Reference

### Main Documentation
- **[`FINAL_REQUIREMENTS.md`](FINAL_REQUIREMENTS.md)** - Complete specifications (1,337 lines)
  - All database schemas
  - Complete algorithm code
  - UI component examples
  - API specifications
  - Testing strategy
  - Deployment guide

### Supporting Documents
- **[`UPDATED_REQUIREMENTS.md`](UPDATED_REQUIREMENTS.md)** - Updated schedule details
- **[`CHANGES_SUMMARY.md`](CHANGES_SUMMARY.md)** - What changed from original plan
- **[`ARCHITECTURE.md`](ARCHITECTURE.md)** - Original architecture design
- **[`TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md)** - Detailed algorithm specification

---

## 🗄️ Database Quick Reference

### Tables
1. **exhibition_config** - Global settings
2. **exhibition_schedule** - Day-specific hours (NEW)
3. **registrations** - User registrations
4. **slots** - Time slots with capacity
5. **slot_assignments** - Registration-to-slot mapping

### Key Queries

**Get available dates:**
```sql
SELECT exhibition_date, day_type, start_time, end_time
FROM exhibition_schedule
WHERE is_active = true AND day_type != 'closed'
ORDER BY exhibition_date;
```

**Check date capacity:**
```sql
SELECT 
  SUM(CASE WHEN language = 'tamil' THEN capacity - filled ELSE 0 END) as tamil_available,
  SUM(CASE WHEN language = 'english' THEN capacity - filled ELSE 0 END) as english_available
FROM slots
WHERE slot_date = '2026-06-07';
```

---

## 🎨 UI Components Needed

### User-Facing
1. **DatePicker** - Shows available dates with capacity indicators
2. **RegistrationForm** - Main form with validation
3. **LanguageSplitInput** - Tamil/English count selector
4. **AlternativeDatesModal** - Shows alternatives when date is full
5. **ConfirmationPage** - Shows registration details

### Admin
1. **ScheduleManager** - Enable/disable dates, modify hours
2. **CapacityDashboard** - Real-time capacity monitoring
3. **RegistrationsList** - View all registrations
4. **DateCapacityView** - Per-date breakdown

---

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_EXHIBITION_NAME=Bible Exhibition 2026

# Admin
ADMIN_PASSWORD=your_secure_password
```

---

## 📊 Algorithm Flow

```
User Registration
    ↓
Select Preferred Date
    ↓
Check Date Availability
    ↓
    ├─ Available → Allocate Slots
    │   ↓
    │   ├─ Single Language → Fill partial slot or create new
    │   └─ Mixed Languages → Find consecutive slots (20 min apart)
    │
    └─ Full → Show Alternative Dates
        ↓
        User Accepts Alternative → Allocate Slots
        OR
        User Declines → Return to Form
```

---

## 🧪 Testing Checklist

- [ ] Single language allocation works
- [ ] Mixed language gets consecutive slots
- [ ] Date selection shows correct availability
- [ ] Alternative dates suggested when date is full
- [ ] Concurrent registrations don't conflict
- [ ] Admin can enable/disable dates
- [ ] Mobile responsive on all screens
- [ ] QR code opens registration form
- [ ] Load test with 100+ concurrent users

---

## 🚀 Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Database schema deployed to Supabase
- [ ] Slots initialized for June 5-21
- [ ] Production URL tested
- [ ] QR code generated with production URL
- [ ] Admin dashboard accessible
- [ ] Monitoring alerts configured
- [ ] Backup plan documented

---

## 📞 Quick Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
```

### Database
```bash
# Initialize slots
SELECT initialize_exhibition_slots();

# Check capacity
SELECT slot_date, language, SUM(capacity - filled) as available
FROM slots
GROUP BY slot_date, language
ORDER BY slot_date;
```

### Deployment
```bash
git add .
git commit -m "Ready for production"
git push origin main
# Vercel auto-deploys
```

---

## 🎯 Success Criteria

✅ System handles 500 registrations/day  
✅ 99.9% uptime during exhibition  
✅ Users can select preferred dates  
✅ Alternative dates suggested smoothly  
✅ Admin can manage schedule  
✅ Mobile-responsive design  
✅ QR code ready for distribution  

---

## 📚 Next Steps

1. **Review** [`FINAL_REQUIREMENTS.md`](FINAL_REQUIREMENTS.md) - Your complete implementation guide
2. **Setup** Supabase account and create database
3. **Initialize** Next.js project with dependencies
4. **Build** following the 14-day timeline
5. **Deploy** to Vercel before June 5

---

**Ready to Start?** Switch to Code mode and begin implementation! 🚀

**Questions?** Refer to [`FINAL_REQUIREMENTS.md`](FINAL_REQUIREMENTS.md) for detailed specifications.