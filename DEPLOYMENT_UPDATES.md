# Deployment Updates - Phone Mandatory & Registration Lookup

## Overview
This update adds phone number as a mandatory field and implements a registration lookup/modification system based on user feedback.

## Key Changes

### 1. Phone Number Made Mandatory
- Phone is now required for all registrations
- Allows users to lookup and manage their registrations
- Prevents duplicate registrations on the same date with the same phone

### 2. Registration Lookup System
- New `/lookup` page for users to view their registrations by phone
- Users can view all registrations associated with their phone number
- Users can cancel registrations (before check-in)
- Direct access to QR codes from lookup page

### 3. Improved User Experience
- Clear call-to-action buttons on home page
- Easy access to registration management
- Better flow for users who want to modify registrations
- Helpful instructions and guidance throughout

## Deployment Steps

### Step 1: Run Database Migration

Execute the SQL migration to make phone mandatory:

```bash
# Connect to your Supabase database and run:
psql -h <your-supabase-host> -U postgres -d postgres -f PHONE_MANDATORY_MIGRATION.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `PHONE_MANDATORY_MIGRATION.sql`
3. Execute the migration

**Important:** This migration will:
- Add phone index for fast lookups
- Update existing NULL phone numbers with placeholder values
- Make phone column NOT NULL
- Add validation constraint (minimum 10 characters)
- Add unique constraint for phone + date combination

### Step 2: Deploy Code Changes

Deploy to Vercel (automatic if connected to Git):

```bash
git add .
git commit -m "Add phone mandatory and registration lookup features"
git push origin main
```

Or manual deployment:
```bash
vercel --prod
```

### Step 3: Verify Deployment

1. **Test Registration Flow:**
   - Go to `/register`
   - Verify phone field is required
   - Complete a registration
   - Verify phone is saved

2. **Test Lookup System:**
   - Go to `/lookup`
   - Enter phone number used in registration
   - Verify registrations are displayed
   - Test QR code access
   - Test cancellation (if not checked in)

3. **Test Admin Portal:**
   - Go to `/admin`
   - Verify registrations show phone numbers
   - Check that all data displays correctly

## New Features

### For Users

1. **Registration Lookup** (`/lookup`)
   - Search by phone number
   - View all registrations
   - Access QR codes
   - Cancel registrations (before check-in)

2. **Improved Home Page**
   - "Register Your Group" button
   - "View My Registration" button
   - Clear navigation

3. **Better Confirmation Page**
   - Link to view all registrations
   - Easy access to manage bookings

### For Admins

1. **Phone Number Tracking**
   - All registrations now have phone numbers
   - Can contact users if needed
   - Better data for analytics

2. **Duplicate Prevention**
   - Same phone can register max 2 times (different dates)
   - Prevents accidental duplicates on same date

## API Endpoints

### New Endpoints

1. **GET `/api/lookup?phone={phone}`**
   - Lookup registrations by phone number
   - Returns all registrations for that phone
   - Includes slot information and QR tokens

2. **DELETE `/api/register/[registrationNumber]`**
   - Cancel a registration
   - Frees up allocated slots
   - Only works if not checked in

### Updated Endpoints

1. **POST `/api/register`**
   - Now requires phone number
   - Validates phone format (min 10 chars)
   - Prevents duplicate on same date

## Database Schema Changes

```sql
-- Phone is now NOT NULL
ALTER TABLE registrations 
ALTER COLUMN phone SET NOT NULL;

-- Phone validation constraint
ALTER TABLE registrations 
ADD CONSTRAINT phone_not_empty CHECK (phone != '' AND LENGTH(phone) >= 10);

-- Unique constraint for phone + date
CREATE UNIQUE INDEX idx_registrations_phone_date ON registrations(phone, preferred_date);

-- Index for fast lookups
CREATE INDEX idx_registrations_phone ON registrations(phone);
```

## User Benefits

1. **Easy Registration Management**
   - Users can find their registrations anytime
   - No need to save confirmation emails
   - Just remember phone number

2. **Flexibility**
   - Can register multiple times (different dates)
   - Can cancel if plans change
   - Can access QR codes anytime

3. **Better Communication**
   - Church can contact users if needed
   - Users can be notified of changes
   - Better support experience

## Admin Benefits

1. **Contact Information**
   - Can reach out to registrants
   - Better customer service
   - Emergency notifications possible

2. **Data Quality**
   - All registrations have contact info
   - Reduced no-shows (can send reminders)
   - Better analytics

3. **Duplicate Prevention**
   - System prevents accidental duplicates
   - Cleaner data
   - Better capacity management

## Rollback Plan

If issues occur, you can rollback:

1. **Revert Code:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Revert Database (if needed):**
   ```sql
   -- Remove constraints
   ALTER TABLE registrations DROP CONSTRAINT IF EXISTS phone_not_empty;
   DROP INDEX IF EXISTS idx_registrations_phone_date;
   
   -- Make phone optional again
   ALTER TABLE registrations ALTER COLUMN phone DROP NOT NULL;
   ```

## Testing Checklist

- [ ] Phone field is required on registration form
- [ ] Registration fails without phone number
- [ ] Registration succeeds with valid phone
- [ ] Lookup page finds registrations by phone
- [ ] QR code access works from lookup page
- [ ] Cancellation works (before check-in)
- [ ] Cancellation fails after check-in
- [ ] Admin portal shows phone numbers
- [ ] Duplicate prevention works (same phone + date)
- [ ] Multiple registrations work (different dates)

## Support

If users have issues:
1. Check phone number format (minimum 10 digits)
2. Verify they're using the same phone number
3. Check if registration was checked in (can't cancel after)
4. Use admin portal to manually assist if needed

## Notes

- Phone numbers are stored as entered (with country code if provided)
- System allows same phone for different dates (max 2 registrations total)
- Cancellation frees up slots immediately
- QR codes remain valid until check-in

---

Made with Bob