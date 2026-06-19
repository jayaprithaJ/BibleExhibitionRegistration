-- Add remaining URL registrations to reach 4,960 total people
-- Current: 2,927 people
-- Target: 4,960 people
-- Need to add: 2,033 people

-- We'll create registrations with average group size of 5 people
-- 2,033 / 5 = ~407 registrations needed

-- Generate 407 pending registrations distributed across various churches and dates
INSERT INTO registrations (
  registration_number, 
  name, 
  church_name, 
  preferred_date, 
  total_people, 
  tamil_count, 
  english_count, 
  phone, 
  email, 
  qr_token, 
  visitor_type,
  checked_in, 
  created_at
)
SELECT 
  'BE-' || LPAD((3000 + generate_series)::TEXT, 4, '0'),
  'Pending Member ' || (3000 + generate_series),
  (ARRAY[
    'KG Halli Church',
    'Ramamurthy Nagar Church',
    'Lowry Kannada Church',
    'Lowry English Church',
    'Pentecost Church',
    'St. Ignatius Church',
    'St. Jude Church',
    'Holy Trinity Church',
    'St. Mary''s Cathedral',
    'Bethel Church',
    'Grace Fellowship',
    'Faith Assembly',
    'Hope Church',
    'Victory Church',
    'Zion Church',
    'Emmanuel Church',
    'Calvary Chapel',
    'New Life Church',
    'Cornerstone Church',
    'Harvest Church'
  ])[1 + (generate_series % 20)],
  (ARRAY[
    '2026-06-20'::DATE,
    '2026-06-21'::DATE,
    '2026-06-22'::DATE
  ])[1 + (generate_series % 3)],
  CASE 
    WHEN generate_series % 10 = 0 THEN 8   -- 10% have 8 people
    WHEN generate_series % 7 = 0 THEN 6    -- ~14% have 6 people
    WHEN generate_series % 5 = 0 THEN 5    -- 20% have 5 people
    WHEN generate_series % 3 = 0 THEN 4    -- ~33% have 4 people
    ELSE 5                                  -- Rest have 5 people (most common)
  END,
  CASE 
    WHEN generate_series % 10 = 0 THEN 4
    WHEN generate_series % 7 = 0 THEN 3
    WHEN generate_series % 5 = 0 THEN 3
    WHEN generate_series % 3 = 0 THEN 2
    ELSE 3
  END,
  CASE 
    WHEN generate_series % 10 = 0 THEN 4
    WHEN generate_series % 7 = 0 THEN 3
    WHEN generate_series % 5 = 0 THEN 2
    WHEN generate_series % 3 = 0 THEN 2
    ELSE 2
  END,
  '+91' || (9100000000 + generate_series)::TEXT,
  'pending' || (3000 + generate_series) || '@church.com',
  md5(random()::text),
  CASE 
    WHEN generate_series % 10 = 0 THEN 'non_adventist'
    ELSE 'adventist'
  END,
  false,  -- All pending (not checked in)
  NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 407);

-- Verify the total
SELECT 
  '=== VERIFICATION ===' as section;

SELECT 
  'Total URL Registrations (People)' as metric,
  SUM(total_people) as count
FROM registrations
WHERE registration_number NOT LIKE '%QR%';

SELECT 
  'Total Pending Registrations' as metric,
  COUNT(*) as registration_count,
  SUM(total_people) as people_count
FROM registrations
WHERE checked_in = false
  AND registration_number NOT LIKE '%QR%';

SELECT 
  'Breakdown by Date (Pending Only)' as section,
  preferred_date,
  COUNT(*) as registrations,
  SUM(total_people) as people
FROM registrations
WHERE checked_in = false
  AND registration_number NOT LIKE '%QR%'
GROUP BY preferred_date
ORDER BY preferred_date;

SELECT 
  'Breakdown by Church (Top 10 Pending)' as section,
  church_name,
  COUNT(*) as registrations,
  SUM(total_people) as people
FROM registrations
WHERE checked_in = false
  AND registration_number NOT LIKE '%QR%'
GROUP BY church_name
ORDER BY people DESC
LIMIT 10;

-- Made with Bob
