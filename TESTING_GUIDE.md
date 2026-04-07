# Testing Guide - Bible Exhibition Registration System

## 🚀 Quick Start Testing

### 1. Start the Application

```bash
# Terminal 1: Start database (if not already running)
docker-compose up -d

# Terminal 2: Start Next.js dev server
npm run dev
```

The app should now be running at http://localhost:3000

### 2. Initialize Database (First Time Only)

```bash
# Run this once to create tables and initialize slots
docker exec -i bible-exhibition-db psql -U postgres -d bible_exhibition < schema.sql
```

Verify initialization:
```bash
docker exec -it bible-exhibition-db psql -U postgres -d bible_exhibition

# Check if tables exist
\dt

# Check slot count
SELECT COUNT(*) FROM slots;
-- Should show 528 slots (8 days × 33 slots/day × 2 languages)

# Exit
\q
```

---

## 🧪 Test Scenarios

### Test 1: Health Check ✅

**URL**: http://localhost:3000/api/health

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-07T...",
  "database": "connected"
}
```

**If it fails**:
- Check if Docker is running: `docker ps`
- Check database logs: `docker logs bible-exhibition-db`
- Verify DATABASE_URL in .env.local

---

### Test 2: View Available Dates ✅

**URL**: http://localhost:3000/api/dates/available

**Expected Response**:
```json
{
  "dates": [
    {
      "date": "2026-06-06",
      "dayType": "friday",
      "hours": "18:00:00 - 21:00:00",
      "availability": 180,
      "fillPercentage": 0,
      "isActive": true
    },
    ...
  ]
}
```

---

### Test 3: Home Page ✅

**URL**: http://localhost:3000

**What to check**:
- [ ] Page loads without errors
- [ ] "Register for Exhibition" button visible
- [ ] Schedule information displayed
- [ ] Features cards showing

---

### Test 4: Registration Form ✅

**URL**: http://localhost:3000/register

**Test Case 1: Single Language (Tamil Only)**

1. Fill form:
   - Name: "John Doe"
   - Church: "Grace Church"
   - Date: Saturday, June 7
   - Total People: 5
   - Tamil: 5
   - English: 0

2. Click "Register Now"

3. **Expected**:
   - Success toast appears
   - Redirects to confirmation page
   - Shows registration number (e.g., BE-ABC123)

4. **Verify in database**:
   ```bash
   docker exec -it bible-exhibition-db psql -U postgres -d bible_exhibition
   
   SELECT * FROM registrations ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM slot_assignments WHERE registration_id = (SELECT id FROM registrations ORDER BY created_at DESC LIMIT 1);
   ```

---

**Test Case 2: Mixed Language**

1. Fill form:
   - Name: "Jane Smith"
   - Church: "Hope Church"
   - Date: Saturday, June 7
   - Total People: 10
   - Tamil: 5
   - English: 5

2. Click "Register Now"

3. **Expected**:
   - Success toast
   - Confirmation page shows TWO time slots
   - Slots are 20 minutes apart

4. **Verify**:
   ```sql
   SELECT 
     r.name,
     r.church_name,
     sa.language,
     sa.people_count,
     s.slot_time,
     sa.group_sequence
   FROM registrations r
   JOIN slot_assignments sa ON sa.registration_id = r.id
   JOIN slots s ON s.id = sa.slot_id
   WHERE r.name = 'Jane Smith'
   ORDER BY sa.group_sequence;
   ```

---

**Test Case 3: Validation Errors**

1. Try submitting with:
   - Tamil: 3, English: 2, Total: 10 (mismatch)

2. **Expected**:
   - Form shows validation error
   - "Tamil count + English count must equal total people"

---

### Test 5: Admin Dashboard ✅

**URL**: http://localhost:3000/admin

**What to check**:
- [ ] Stats cards display
- [ ] Total registrations count
- [ ] Capacity information
- [ ] Schedule information

---

### Test 6: Confirmation Page ✅

**URL**: http://localhost:3000/confirmation?reg=BE-TEST123

**What to check**:
- [ ] Registration number displayed
- [ ] Instructions shown
- [ ] Print button works
- [ ] Back to home button works

---

## 🔍 Database Inspection Commands

### View All Registrations
```sql
SELECT 
  registration_number,
  name,
  church_name,
  preferred_date,
  total_people,
  tamil_count,
  english_count,
  created_at
FROM registrations
ORDER BY created_at DESC;
```

### View Slot Capacity by Date
```sql
SELECT 
  slot_date,
  language,
  COUNT(*) as total_slots,
  SUM(capacity) as total_capacity,
  SUM(filled) as total_filled,
  SUM(capacity - filled) as available
FROM slots
GROUP BY slot_date, language
ORDER BY slot_date, language;
```

### View Slot Assignments
```sql
SELECT 
  r.registration_number,
  r.name,
  s.slot_date,
  s.slot_time,
  sa.language,
  sa.people_count,
  sa.group_sequence
FROM slot_assignments sa
JOIN registrations r ON r.id = sa.registration_id
JOIN slots s ON s.id = sa.slot_id
ORDER BY r.created_at DESC, sa.group_sequence;
```

### Check Consecutive Slots
```sql
SELECT 
  r.registration_number,
  r.name,
  STRING_AGG(
    sa.language || ': ' || s.slot_time, 
    ' | ' 
    ORDER BY sa.group_sequence
  ) as time_slots
FROM registrations r
JOIN slot_assignments sa ON sa.registration_id = r.id
JOIN slots s ON s.id = sa.slot_id
WHERE r.tamil_count > 0 AND r.english_count > 0
GROUP BY r.id, r.registration_number, r.name;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'pg'"
```bash
# Solution: Install dependencies
npm install
```

### Issue 2: Database connection failed
```bash
# Check if Docker is running
docker ps

# Restart database
docker-compose restart

# Check logs
docker logs bible-exhibition-db
```

### Issue 3: No slots available
```bash
# Reinitialize slots
docker exec -it bible-exhibition-db psql -U postgres -d bible_exhibition

SELECT initialize_exhibition_slots();
\q
```

### Issue 4: Port 3000 already in use
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Or use different port
npm run dev -- -p 3001
```

### Issue 5: TypeScript errors
```bash
# These are expected until all dependencies are installed
npm install

# Restart dev server
npm run dev
```

---

## ✅ Test Checklist

### Basic Functionality
- [ ] Home page loads
- [ ] Registration form loads
- [ ] Can submit registration
- [ ] Confirmation page shows
- [ ] Admin dashboard loads
- [ ] Health check returns healthy

### Registration Flow
- [ ] Single language registration works
- [ ] Mixed language gets consecutive slots
- [ ] Validation catches errors
- [ ] Database records created correctly
- [ ] Slot capacity updates

### Database
- [ ] Tables created successfully
- [ ] Slots initialized (528 total)
- [ ] Registrations saved
- [ ] Slot assignments created
- [ ] Capacity tracking works

### API Endpoints
- [ ] GET /api/health
- [ ] POST /api/register
- [ ] GET /api/dates/available
- [ ] GET /api/dates/[date]/availability

---

## 📊 Expected Database State After Tests

After running all test scenarios, you should have:

- **Registrations**: 2+ entries
- **Slot Assignments**: 3+ entries (1 for single language, 2 for mixed)
- **Slots**: 528 total, some with filled > 0
- **Exhibition Schedule**: 17 entries (8 active, 9 closed)
- **Exhibition Config**: 1 entry

---

## 🎯 Success Criteria

✅ All pages load without errors  
✅ Registration creates database records  
✅ Consecutive slots allocated for mixed groups  
✅ Validation works correctly  
✅ Database queries execute successfully  
✅ API endpoints return expected data  

---

## 📝 Next Steps After Testing

1. ✅ Verify all basic functionality works
2. 🔄 Add more UI components (date picker, alternative dates modal)
3. 🔄 Implement real-time capacity updates
4. 🔄 Add admin authentication
5. 🔄 Enhance admin dashboard with charts
6. 🚀 Deploy to production

---

**Happy Testing!** 🎉

If you encounter any issues, check the troubleshooting section or review the logs.