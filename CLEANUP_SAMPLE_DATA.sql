-- Cleanup Sample Data Script
-- This removes only the sample data inserted by INSERT_EXHIBITION_DATA.sql
-- Preserves your existing real registrations

-- First, let's see what we're about to delete
SELECT 
  'Records to be deleted' as action,
  COUNT(*) as count
FROM registrations
WHERE 
  -- Sample data uses specific registration number patterns
  (registration_number LIKE 'BE-0001' OR
   registration_number LIKE 'BE-0002' OR
   registration_number LIKE 'BE-0003' OR
   registration_number LIKE 'BE-0004' OR
   registration_number LIKE 'BE-0005' OR
   registration_number LIKE 'BE-0006' OR
   registration_number LIKE 'BE-0007' OR
   registration_number LIKE 'BE-0008' OR
   registration_number LIKE 'BE-0009' OR
   registration_number BETWEEN 'BE-0001' AND 'BE-0030' OR
   registration_number BETWEEN 'BE-0100' AND 'BE-0130' OR
   registration_number BETWEEN 'BE-0200' AND 'BE-0230' OR
   registration_number BETWEEN 'BE-0300' AND 'BE-0330' OR
   registration_number BETWEEN 'BE-0400' AND 'BE-0605' OR
   registration_number BETWEEN 'BE-0700' AND 'BE-0906' OR
   registration_number BETWEEN 'BE-1000' AND 'BE-1028' OR
   registration_number BETWEEN 'BE-1100' AND 'BE-1128')
  -- Also check by email patterns used in sample data
  OR email LIKE '%@kghalli.com'
  OR email LIKE '%@rmnagar.com'
  OR email LIKE '%@lowrykannada.com'
  OR email LIKE '%@lowryenglish.com'
  OR email LIKE '%@spot.com'
  OR email LIKE '%@walkin.com'
  OR (email LIKE 'visitor%@email.com' AND visitor_type = 'non_adventist');

-- Show breakdown by church
SELECT 
  church_name,
  visitor_type,
  COUNT(*) as count
FROM registrations
WHERE 
  email LIKE '%@kghalli.com'
  OR email LIKE '%@rmnagar.com'
  OR email LIKE '%@lowrykannada.com'
  OR email LIKE '%@lowryenglish.com'
  OR email LIKE '%@spot.com'
  OR email LIKE '%@walkin.com'
  OR (email LIKE 'visitor%@email.com' AND visitor_type = 'non_adventist')
GROUP BY church_name, visitor_type
ORDER BY church_name, visitor_type;

-- Delete the sample data
-- UNCOMMENT THE LINES BELOW TO ACTUALLY DELETE THE DATA
-- DELETE FROM registrations
-- WHERE 
--   email LIKE '%@kghalli.com'
--   OR email LIKE '%@rmnagar.com'
--   OR email LIKE '%@lowrykannada.com'
--   OR email LIKE '%@lowryenglish.com'
--   OR email LIKE '%@spot.com'
--   OR email LIKE '%@walkin.com'
--   OR (email LIKE 'visitor%@email.com' AND visitor_type = 'non_adventist');

-- Verify remaining records
SELECT 
  'Remaining records after cleanup' as status,
  COUNT(*) as count
FROM registrations;

-- Show visitor type breakdown after cleanup
SELECT 
  visitor_type,
  COUNT(*) as registrations,
  SUM(total_people) as total_visitors,
  ROUND(SUM(total_people) * 100.0 / NULLIF((SELECT SUM(total_people) FROM registrations), 0), 1) as percentage
FROM registrations
GROUP BY visitor_type
ORDER BY total_visitors DESC;

-- Made with Bob
