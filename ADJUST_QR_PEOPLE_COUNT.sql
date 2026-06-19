-- Adjust QR registrations to have fewer people
-- Currently: 104 QR registrations with 364 people
-- Target: Keep 104 QR registrations but reduce to ~200 people

-- Step 1: Check current QR registration distribution
SELECT 
  total_people,
  COUNT(*) as registration_count,
  SUM(total_people) as total_people_sum
FROM registrations
WHERE registration_number LIKE '%QR%'
GROUP BY total_people
ORDER BY total_people;

-- Step 2: Update QR registrations to have 1-3 people each (instead of current average)
-- This will give us approximately 104 × 2 = 208 people

UPDATE registrations
SET total_people = (
  CASE 
    WHEN (random() * 100)::int < 30 THEN 1  -- 30% have 1 person
    WHEN (random() * 100)::int < 70 THEN 2  -- 40% have 2 people
    ELSE 3                                   -- 30% have 3 people
  END
),
tamil_count = (
  CASE 
    WHEN (random() * 100)::int < 30 THEN 1
    WHEN (random() * 100)::int < 70 THEN 2
    ELSE 3
  END
),
english_count = 0
WHERE registration_number LIKE '%QR%';

-- Step 3: Verify the new distribution
SELECT 
  'QR Registrations' as type,
  COUNT(*) as registration_count,
  SUM(total_people) as total_people,
  ROUND(AVG(total_people), 2) as avg_people_per_registration
FROM registrations
WHERE registration_number LIKE '%QR%';

-- Step 4: Show overall summary
SELECT 
  CASE 
    WHEN registration_number LIKE 'BE-QR-%' THEN 'QR Registrations'
    WHEN registration_number LIKE 'BE-SPOT-%' THEN 'Spot/Walk-in'
    WHEN registration_number LIKE 'BE-%' THEN 'URL Registrations'
    ELSE 'Other'
  END as registration_type,
  COUNT(*) as registration_count,
  SUM(total_people) as total_people
FROM registrations
GROUP BY 
  CASE 
    WHEN registration_number LIKE 'BE-QR-%' THEN 'QR Registrations'
    WHEN registration_number LIKE 'BE-SPOT-%' THEN 'Spot/Walk-in'
    WHEN registration_number LIKE 'BE-%' THEN 'URL Registrations'
    ELSE 'Other'
  END
ORDER BY total_people DESC;

-- Made with Bob
