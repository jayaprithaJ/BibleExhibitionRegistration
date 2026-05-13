-- Migration: Make phone mandatory and add phone lookup support
-- Date: 2026-05-13
-- Purpose: Enable phone-based registration lookup and modification

-- Step 1: Add index for phone lookups (before making it NOT NULL)
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone);

-- Step 2: Update any existing NULL phone numbers with a placeholder
-- (This ensures the NOT NULL constraint won't fail)
UPDATE registrations 
SET phone = 'LEGACY-' || registration_number 
WHERE phone IS NULL OR phone = '';

-- Step 3: Make phone column NOT NULL
ALTER TABLE registrations 
ALTER COLUMN phone SET NOT NULL;

-- Step 4: Add constraint to ensure phone is not empty
ALTER TABLE registrations 
ADD CONSTRAINT phone_not_empty CHECK (phone != '' AND LENGTH(phone) >= 10);

-- Step 5: Add unique constraint for phone + preferred_date combination
-- This allows same phone to register for different dates but prevents duplicates on same date
CREATE UNIQUE INDEX idx_registrations_phone_date ON registrations(phone, preferred_date);

-- Verification query
SELECT 
  'Total registrations' as metric,
  COUNT(*) as count
FROM registrations
UNION ALL
SELECT 
  'Registrations with phone',
  COUNT(*)
FROM registrations
WHERE phone IS NOT NULL AND phone != '';

-- Made with Bob