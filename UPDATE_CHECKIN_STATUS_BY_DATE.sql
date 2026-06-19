-- Update Check-in Status Based on Date
-- Mark all registrations with dates BEFORE today as completed
-- Keep registrations with dates TODAY or LATER as pending

-- Current date for reference
SELECT 'Current Date: ' || CURRENT_DATE as info;

-- Show what will be updated
SELECT 
  'BEFORE UPDATE - Status by Date' as section,
  preferred_date,
  COUNT(*) as total_registrations,
  SUM(total_people) as total_people,
  SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as currently_completed,
  SUM(CASE WHEN NOT checked_in THEN 1 ELSE 0 END) as currently_pending,
  CASE 
    WHEN preferred_date < CURRENT_DATE THEN 'Will mark as COMPLETED'
    ELSE 'Will keep as PENDING'
  END as action
FROM registrations
GROUP BY preferred_date
ORDER BY preferred_date;

-- Update registrations with dates BEFORE today to completed
UPDATE registrations
SET 
  checked_in = true,
  checked_in_at = NOW(),
  checked_in_by = 'Auto-completed (past date)'
WHERE preferred_date < CURRENT_DATE
  AND checked_in = false;

-- Update registrations with dates TODAY or LATER to pending
UPDATE registrations
SET 
  checked_in = false,
  checked_in_at = NULL,
  checked_in_by = NULL
WHERE preferred_date >= CURRENT_DATE
  AND checked_in = true;

-- Show results after update
SELECT 
  'AFTER UPDATE - Status by Date' as section,
  preferred_date,
  COUNT(*) as total_registrations,
  SUM(total_people) as total_people,
  SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN NOT checked_in THEN 1 ELSE 0 END) as pending,
  CASE 
    WHEN preferred_date < CURRENT_DATE THEN '✓ Past (Completed)'
    WHEN preferred_date = CURRENT_DATE THEN '→ Today (Pending)'
    ELSE '⏳ Future (Pending)'
  END as status
FROM registrations
GROUP BY preferred_date
ORDER BY preferred_date;

-- Summary
SELECT 
  '=== FINAL SUMMARY ===' as section;

SELECT 
  'Total Completed (Past Dates)' as metric,
  COUNT(*) as registrations,
  SUM(total_people) as people
FROM registrations
WHERE checked_in = true;

SELECT 
  'Total Pending (Today & Future)' as metric,
  COUNT(*) as registrations,
  SUM(total_people) as people
FROM registrations
WHERE checked_in = false;

SELECT 
  'Breakdown by Status' as section,
  CASE WHEN checked_in THEN 'Completed' ELSE 'Pending' END as status,
  COUNT(*) as registrations,
  SUM(total_people) as people,
  ROUND(SUM(total_people) * 100.0 / (SELECT SUM(total_people) FROM registrations), 1) as percentage
FROM registrations
GROUP BY checked_in
ORDER BY checked_in DESC;

-- Made with Bob
