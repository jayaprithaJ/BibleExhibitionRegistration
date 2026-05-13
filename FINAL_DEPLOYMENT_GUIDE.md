# Final Deployment Guide - Bible Exhibition Registration

## Overview
This guide covers deploying all the improvements including phone mandatory, registration lookup, and schedule updates.

## ⚠️ Important: SQL Scripts Must Be Run Manually

**Vercel only deploys code changes.** Database migrations must be run separately in Supabase.

## Step-by-Step Deployment

### Step 1: Run Database Migrations in Supabase

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Run migrations in this order:

**First Migration - Phone Mandatory:**
```sql
-- Copy and paste contents of PHONE_MANDATORY_MIGRATION.sql
-- Then click "Run" or press Ctrl+Enter
```

**Second Migration - Schedule Update:**
```sql
-- Copy and paste contents of UPDATE_SCHEDULE_TIMINGS.sql
-- Then click "Run" or press Ctrl+Enter
```

**Option B: Via Command Line**

```bash
# Set your Supabase connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
psql $DATABASE_URL -f PHONE_MANDATORY_MIGRATION.sql
psql $DATABASE_URL -f UPDATE_SCHEDULE_TIMINGS.sql
```

### Step 2: Verify Database Changes

Run this query in Supabase SQL Editor to verify:

```sql
-- Check phone is mandatory
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'registrations' AND column_name = 'phone';

-- Check schedule updates
SELECT exhibition_date, day_type, start_time, end_time, is_active, notes
FROM exhibition_schedule
ORDER BY exhibition_date;

-- Check slot counts
SELECT 
  es.exhibition_date,
  es.day_type,
  COUNT(s.id) as slot_count,
  SUM(s.capacity) as total_capacity
FROM exhibition_schedule es
LEFT JOIN slots s ON s.slot_date = es.exhibition_date
WHERE es.is_active = true
GROUP BY es.exhibition_date, es.day_type
ORDER BY es.exhibition_date;
```

Expected results:
- Phone column: `is_nullable = NO`
- Friday dates: `is_active = false`
- Saturday slots: Should skip 5:00-6:00 PM
- Sunday slots: Start at 9:30 AM

### Step 3: Deploy Code to Vercel

**Option A: Automatic (if connected to Git)**

```bash
git add .
git commit -m "Add phone mandatory, registration lookup, and schedule updates"
git push origin main
```

Vercel will automatically deploy.

**Option B: Manual Deployment**

```bash
vercel --prod
```

### Step 4: Verify Deployment

**Check these pages:**

1. **Home Page** (`/`)
   - [ ] Phone lookup form visible
   - [ ] New schedule displayed (Sat: 1:30-8, Sun: 9:30-8)
   - [ ] Friday notice shows "call to register"

2. **Registration Page** (`/register`)
   - [ ] Phone field is required (has red asterisk)
   - [ ] Only 6 dates shown (no Fridays)
   - [ ] Friday notice displayed

3. **Lookup Page** (`/lookup`)
   - [ ] Can search by phone number
   - [ ] Shows registrations
   - [ ] QR code instructions visible

4. **Confirmation Page** (`/confirmation`)
   - [ ] QR code displayed
   - [ ] Green box with "Show QR Code at Entry"
   - [ ] Clear instructions

5. **Admin Portal** (`/admin`)
   - [ ] Registrations display
   - [ ] Phone numbers visible
   - [ ] Stats show correctly

## Troubleshooting

### Issue: "Phone cannot be null" error

**Cause:** Migration not run or failed
**Solution:** 
1. Go to Supabase SQL Editor
2. Run `PHONE_MANDATORY_MIGRATION.sql` again
3. Check for any error messages

### Issue: Friday dates still showing in registration form

**Cause:** Browser cache
**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try incognito/private window

### Issue: Old schedule times showing

**Cause:** Migration not run or cache
**Solution:**
1. Verify migration ran: Check `exhibition_schedule` table
2. Hard refresh browser
3. Check Vercel deployment logs

### Issue: Slots during Saturday break time (5-6 PM)

**Cause:** Migration didn't delete break slots
**Solution:**
```sql
-- Run this in Supabase SQL Editor
DELETE FROM slots 
WHERE slot_date IN (
  SELECT exhibition_date 
  FROM exhibition_schedule 
  WHERE day_type = 'weekend' 
    AND EXTRACT(DOW FROM exhibition_date) = 6
)
AND slot_time >= '17:00:00' 
AND slot_time < '18:00:00';
```

## Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] Code deployed to Vercel
- [ ] Home page shows new schedule
- [ ] Registration form requires phone
- [ ] Friday dates not in dropdown
- [ ] Lookup page works with phone search
- [ ] QR code instructions visible
- [ ] Admin portal displays registrations
- [ ] Test complete registration flow
- [ ] Test lookup by phone
- [ ] Test cancellation

## Testing the Complete Flow

### Test 1: New Registration
1. Go to home page
2. Click "Register Your Group"
3. Fill form with phone number
4. Submit
5. Verify confirmation page shows QR code
6. Verify "Show QR Code at Entry" instructions

### Test 2: Lookup Registration
1. Go to home page
2. Enter phone number in lookup form
3. Click "Find"
4. Verify registrations display
5. Click "View QR Code"
6. Verify QR code page loads

### Test 3: Cancel Registration
1. Use lookup to find registration
2. Click "Cancel" button
3. Confirm cancellation
4. Verify registration removed
5. Verify slots freed up (check admin portal)

## Important Notes

### About SQL Migrations

- **Cannot be automated** in Vercel deployment
- **Must be run manually** in Supabase
- **Run only once** per environment
- **Backup database** before running (optional but recommended)

### About Existing Registrations

**PHONE_MANDATORY_MIGRATION.sql** handles existing data:
- Existing NULL phone numbers get placeholder: `LEGACY-{registration_number}`
- You may want to contact these users to update their phone numbers
- Or manually update in Supabase dashboard

### About Friday Registrations

- Friday dates are **disabled in portal**
- Users must **call church office**
- Admin can manually add Friday registrations via database if needed

## Rollback Plan

If something goes wrong:

### Rollback Code (Vercel)
```bash
# Via Vercel Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "..." menu
4. Click "Promote to Production"
```

### Rollback Database (Supabase)
```sql
-- Make phone optional again
ALTER TABLE registrations ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS phone_not_empty;
DROP INDEX IF EXISTS idx_registrations_phone_date;

-- Re-enable Friday dates
UPDATE exhibition_schedule 
SET is_active = true 
WHERE day_type = 'friday';

-- Revert schedule times (if needed)
UPDATE exhibition_schedule 
SET start_time = '09:00:00', end_time = '20:00:00'
WHERE day_type = 'weekend';
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Check browser console for errors
4. Verify environment variables in Vercel
5. Test database connection

## Summary

**Two-Step Process:**
1. **Database:** Run SQL scripts in Supabase (manual)
2. **Code:** Deploy to Vercel (automatic via Git or manual)

**Order Matters:**
1. Run database migrations first
2. Then deploy code
3. This ensures code expects the new database structure

---

Made with Bob