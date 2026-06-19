-- Add visitor_type column to registrations table
-- This tracks whether visitors are Adventist or Non-Adventist

ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS visitor_type VARCHAR(20) DEFAULT 'adventist' 
CHECK (visitor_type IN ('adventist', 'non_adventist'));

-- Create index for visitor_type
CREATE INDEX IF NOT EXISTS idx_registrations_visitor_type ON registrations(visitor_type);

-- Update existing records to be 'adventist' by default
UPDATE registrations 
SET visitor_type = 'adventist' 
WHERE visitor_type IS NULL;

-- Verify the change
SELECT 
  visitor_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM registrations
GROUP BY visitor_type
ORDER BY count DESC;

-- Made with Bob
