-- Update Exhibition Schedule Timings
-- Date: 2026-05-13
-- Changes:
-- - Saturday: 1:30 PM - 5:00 PM, then 6:00 PM - 8:00 PM (with break)
-- - Sunday: 9:30 AM - 8:00 PM
-- - Friday: Call-only registration (not available in portal)

-- Step 1: Disable all Friday dates (call-only registration)
UPDATE exhibition_schedule 
SET is_active = false,
    notes = 'Friday slots available by phone registration only. Call church office to book.'
WHERE day_type = 'friday';

-- Step 2: Update Saturday timings (1:30 PM - 5:00 PM, 6:00 PM - 8:00 PM)
UPDATE exhibition_schedule 
SET start_time = '13:30:00',
    end_time = '20:00:00',
    notes = 'Saturday sessions: 1:30 PM - 5:00 PM, then 6:00 PM - 8:00 PM (break from 5:00-6:00 PM)'
WHERE day_type = 'weekend' 
  AND EXTRACT(DOW FROM exhibition_date) = 6; -- Saturday

-- Step 3: Update Sunday timings (9:30 AM - 8:00 PM)
UPDATE exhibition_schedule 
SET start_time = '09:30:00',
    end_time = '20:00:00',
    notes = 'Sunday sessions: 9:30 AM - 8:00 PM (continuous)'
WHERE day_type = 'weekend' 
  AND EXTRACT(DOW FROM exhibition_date) = 0; -- Sunday

-- Step 4: Delete existing slots (will be regenerated with new timings)
DELETE FROM slot_assignments;
DELETE FROM slots;

-- Step 5: Regenerate slots with new timings
SELECT initialize_exhibition_slots();

-- Step 6: For Saturday, we need to manually remove slots during break time (5:00-6:00 PM)
-- Delete slots between 5:00 PM and 6:00 PM on Saturdays
DELETE FROM slots 
WHERE slot_date IN (
  SELECT exhibition_date 
  FROM exhibition_schedule 
  WHERE day_type = 'weekend' 
    AND EXTRACT(DOW FROM exhibition_date) = 6
)
AND slot_time >= '17:00:00' 
AND slot_time < '18:00:00';

-- Verification
SELECT 
  es.exhibition_date,
  es.day_type,
  es.start_time,
  es.end_time,
  es.is_active,
  es.notes,
  COUNT(s.id) as total_slots,
  SUM(s.capacity) as total_capacity
FROM exhibition_schedule es
LEFT JOIN slots s ON s.slot_date = es.exhibition_date
WHERE es.day_type != 'closed'
GROUP BY es.exhibition_date, es.day_type, es.start_time, es.end_time, es.is_active, es.notes
ORDER BY es.exhibition_date;

-- Show Saturday slot times (should skip 5:00-6:00 PM)
SELECT DISTINCT slot_time 
FROM slots 
WHERE slot_date IN (
  SELECT exhibition_date 
  FROM exhibition_schedule 
  WHERE day_type = 'weekend' 
    AND EXTRACT(DOW FROM exhibition_date) = 6
)
ORDER BY slot_time;

-- Made with Bob