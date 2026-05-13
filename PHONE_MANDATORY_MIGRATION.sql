-- Migration: Make phone mandatory and add phone lookup support
-- Date: 2026-05-13
-- Purpose: Enable phone-based registration lookup and modification

-- Step 1: First, increase phone column size to accommodate longer values
ALTER TABLE registrations
ALTER COLUMN phone TYPE VARCHAR(50);

-- Step 2: Add index for phone lookups (before making it NOT NULL)
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone);

-- Step 3: Update any existing NULL phone numbers with a placeholder
-- (This ensures the NOT NULL constraint won't fail)
-- Using shorter placeholder that fits in 50 chars
UPDATE registrations
SET phone = 'LEGACY-' || SUBSTRING(registration_number, 1, 10)
WHERE phone IS NULL OR phone = '';

-- Step 4: Make phone column NOT NULL (only if not already set)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations'
    AND column_name = 'phone'
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE registrations ALTER COLUMN phone SET NOT NULL;
  END IF;
END $$;

-- Step 5: Add constraint to ensure phone is not empty (drop if exists first)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'phone_not_empty'
    AND table_name = 'registrations'
  ) THEN
    ALTER TABLE registrations DROP CONSTRAINT phone_not_empty;
  END IF;
  ALTER TABLE registrations ADD CONSTRAINT phone_not_empty CHECK (phone != '' AND LENGTH(phone) >= 10);
END $$;

-- Step 6: Add unique constraint for phone + preferred_date combination
-- Drop if exists first, then create
DROP INDEX IF EXISTS idx_registrations_phone_date;
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