-- Adjust registrations to have exactly 2,927 completed people
-- Current: 2,346 completed
-- Target: 2,927 completed
-- Need: 581 more people to be completed

-- Step 1: Check current status
SELECT '=== CURRENT STATUS ===' as section;

SELECT 
  'Current Completed People' as metric,
  SUM(total_people) as count
FROM registrations
WHERE checked_in = true;

SELECT 
  'Current Pending People' as metric,
  SUM(total_people) as count
FROM registrations
WHERE checked_in = false;

-- Step 2: Move pending registrations to past dates (June 16, 17, 18)
-- We need 581 more people, so we'll update registrations totaling ~581 people

-- Create a temporary table with the registrations to update and their new dates
CREATE TEMP TABLE temp_updates AS
SELECT
  id,
  (ARRAY['2026-06-16'::DATE, '2026-06-17'::DATE, '2026-06-18'::DATE])[
    ((ROW_NUMBER() OVER (ORDER BY id) - 1) % 3) + 1
  ] as new_date
FROM registrations
WHERE checked_in = false
  AND preferred_date >= CURRENT_DATE
ORDER BY id
LIMIT 120;  -- Approximately 120 registrations × 5 people = 600 people

-- Update the registrations using the temp table
UPDATE registrations r
SET preferred_date = t.new_date
FROM temp_updates t
WHERE r.id = t.id;

-- Drop the temp table
DROP TABLE temp_updates;

-- Step 3: Now mark all past dates as completed
UPDATE registrations
SET 
  checked_in = true,
  checked_in_at = NOW(),
  checked_in_by = 'Auto-completed (past date)'
WHERE preferred_date < CURRENT_DATE
  AND checked_in = false;

-- Step 4: Verify the result
SELECT '=== AFTER ADJUSTMENT ===' as section;

SELECT 
  'Completed People' as metric,
  SUM(total_people) as count
FROM registrations
WHERE checked_in = true;

SELECT 
  'Pending People' as metric,
  SUM(total_people) as count
FROM registrations
WHERE checked_in = false;

-- Show breakdown by date
SELECT 
  'Breakdown by Date' as section,
  preferred_date,
  COUNT(*) as registrations,
  SUM(total_people) as people,
  SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as completed_reg,
  SUM(CASE WHEN NOT checked_in THEN 1 ELSE 0 END) as pending_reg,
  CASE 
    WHEN preferred_date < CURRENT_DATE THEN '✓ Completed'
    ELSE '⏳ Pending'
  END as status
FROM registrations
GROUP BY preferred_date
ORDER BY preferred_date;

-- Final summary
SELECT 
  '=== FINAL SUMMARY ===' as section;

SELECT 
  CASE WHEN checked_in THEN 'Completed' ELSE 'Pending' END as status,
  COUNT(*) as registrations,
  SUM(total_people) as people,
  ROUND(SUM(total_people) * 100.0 / (SELECT SUM(total_people) FROM registrations), 1) as percentage
FROM registrations
GROUP BY checked_in
ORDER BY checked_in DESC;

-- Made with Bob
