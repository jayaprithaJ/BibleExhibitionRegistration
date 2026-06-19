-- Update visitor type distribution
-- Move ~1155 people from non_adventist to adventist
-- Target: ~200 non-adventist, ~3091 adventist

-- Step 1: Check current distribution
SELECT 
  visitor_type,
  COUNT(*) as registration_count,
  SUM(total_people) as total_people
FROM registrations
GROUP BY visitor_type
ORDER BY visitor_type;

-- Step 2: Calculate how many registrations to update
-- We need to move ~1155 people from non_adventist to adventist
-- Assuming average 5 people per registration, we need to update ~231 registrations

-- Step 3: Update non_adventist registrations to adventist
-- Keep only ~40 registrations as non_adventist (40 × 5 = 200 people)
UPDATE registrations
SET visitor_type = 'adventist'
WHERE id IN (
  SELECT id
  FROM registrations
  WHERE visitor_type = 'non_adventist'
  ORDER BY id
  LIMIT (
    SELECT COUNT(*) - 40
    FROM registrations
    WHERE visitor_type = 'non_adventist'
  )
);

-- Step 4: Verify the new distribution
SELECT 
  visitor_type,
  COUNT(*) as registration_count,
  SUM(total_people) as total_people,
  ROUND(100.0 * SUM(total_people) / (SELECT SUM(total_people) FROM registrations), 1) as percentage
FROM registrations
GROUP BY visitor_type
ORDER BY visitor_type;

-- Step 5: Show summary
SELECT 
  'Total Visitors' as metric,
  SUM(total_people) as count
FROM registrations
UNION ALL
SELECT 
  'Adventist' as metric,
  SUM(total_people) as count
FROM registrations
WHERE visitor_type = 'adventist'
UNION ALL
SELECT 
  'Non-Adventist' as metric,
  SUM(total_people) as count
FROM registrations
WHERE visitor_type = 'non_adventist';

-- Made with Bob
