-- QR Code System Database Migration
-- Run this if you have existing registrations in your database

-- Add new columns for QR code check-in system
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS qr_token VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_in_by VARCHAR(255);

-- Generate secure tokens for existing registrations (if any)
UPDATE registrations 
SET qr_token = md5(random()::text || clock_timestamp()::text)::text || md5(random()::text || clock_timestamp()::text)::text
WHERE qr_token IS NULL;

-- Make qr_token NOT NULL after populating existing records
ALTER TABLE registrations 
ALTER COLUMN qr_token SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in ON registrations(checked_in);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'registrations' 
  AND column_name IN ('qr_token', 'checked_in', 'checked_in_at', 'checked_in_by')
ORDER BY ordinal_position;

-- Made with Bob
