-- Complete Data Setup Script
-- Run this after deployment to set up all registration data
-- Target: 2,927 people via URL, 104 QR registrations

-- Clear existing registrations (if any)
TRUNCATE registrations CASCADE;

-- Helper function to generate registration numbers
CREATE OR REPLACE FUNCTION generate_reg_number(prefix TEXT, num INTEGER) 
RETURNS TEXT AS $$
BEGIN
  RETURN prefix || '-' || LPAD(num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 1: Add QR Registrations (104 total)
-- ============================================
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-QR-' || LPAD(generate_series::TEXT, 4, '0'),
  'QR Member ' || generate_series,
  CASE
    WHEN generate_series <= 20 THEN 'Pentecost Church'
    WHEN generate_series <= 40 THEN 'St. Ignatius Church'
    WHEN generate_series <= 60 THEN 'St. Jude Church'
    WHEN generate_series <= 80 THEN 'St. Mary''s Cathedral'
    ELSE 'Holy Trinity Church'
  END,
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE])[1 + (generate_series % 4)],
  (ARRAY[2, 3, 4, 5])[1 + (generate_series % 4)],
  (ARRAY[1, 2, 2, 3])[1 + (generate_series % 4)],
  (ARRAY[1, 1, 2, 2])[1 + (generate_series % 4)],
  '+91' || (9500000000 + generate_series)::TEXT,
  'qrmember' || generate_series || '@email.com',
  md5(random()::text || generate_series::text),
  CASE WHEN generate_series % 10 = 0 THEN 'non_adventist' ELSE 'adventist' END,
  false,  -- All QR registrations are pending
  NOW() - (random() * INTERVAL '12 days')
FROM generate_series(1, 104);

-- ============================================
-- PART 2: Add URL Registrations
-- Target: EXACTLY 2,927 people total
-- Breakdown:
-- Lowry Kannada: 5 reg × 5 people = 25
-- Lowry English: 5 reg × 5 people = 25
-- Pentecost: 80 reg × 5 people = 400
-- St. Ignatius: 70 reg × 5 people = 350
-- St. Jude: 60 reg × 5 people = 300
-- St. Mary's: 60 reg × 5 people = 300
-- Holy Trinity: 50 reg × 5 people = 250
-- Others: 254 reg × 5 people + 1 reg × 2 people = 1,272 + 5 = 1,277
-- TOTAL: 585 registrations = 2,927 people
-- ============================================

-- Lowry Kannada Church (5 registrations, 25 people)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-' || LPAD((100 + generate_series)::TEXT, 4, '0'),
  'Member ' || (100 + generate_series),
  'Lowry Kannada Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE])[1 + (generate_series % 3)],
  5,
  3,
  2,
  '+91' || (9200000000 + generate_series)::TEXT,
  'member' || (100 + generate_series) || '@lowrykannada.com',
  md5(random()::text),
  'adventist',
  true,  -- All completed
  NOW() - (random() * INTERVAL '10 days')
FROM generate_series(1, 5);

-- Lowry English Church (5 registrations, 25 people)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-' || LPAD((200 + generate_series)::TEXT, 4, '0'),
  'Member ' || (200 + generate_series),
  'Lowry English Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE])[1 + (generate_series % 3)],
  5,
  2,
  3,
  '+91' || (9300000000 + generate_series)::TEXT,
  'member' || (200 + generate_series) || '@lowryenglish.com',
  md5(random()::text),
  'adventist',
  true,  -- All completed
  NOW() - (random() * INTERVAL '10 days')
FROM generate_series(1, 5);

-- Pentecost Church (80 registrations, 400 people)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-' || LPAD((300 + generate_series)::TEXT, 4, '0'),
  'Member ' || (300 + generate_series),
  'Pentecost Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  5,
  3,
  2,
  '+91' || (9400000000 + generate_series)::TEXT,
  'member' || (300 + generate_series) || '@pentecost.com',
  md5(random()::text),
  'adventist',
  true,  -- All completed
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 80);

-- St. Ignatius Church (70 registrations, 350 people)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-' || LPAD((500 + generate_series)::TEXT, 4, '0'),
  'Member ' || (500 + generate_series),
  'St. Ignatius Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  5,
  3,
  2,
  '+91' || (9600000000 + generate_series)::TEXT,
  'member' || (500 + generate_series) || '@stignatius.com',
  md5(random()::text),
  'non_adventist',
  true,  -- All completed
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 70);

-- St. Jude Church (60 registrations, 300 people)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-' || LPAD((700 + generate_series)::TEXT, 4, '0'),
  'Member ' || (700 + generate_series),
  'St. Jude Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  5,
  3,
  2,
  '+91' || (9700000000 + generate_series)::TEXT,
  'member' || (700 + generate_series) || '@stjude.com',
  md5(random()::text),
  'non_adventist',
  true,  -- All completed
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 60);

-- St. Mary's Cathedral (60 registrations, 300 people)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-' || LPAD((900 + generate_series)::TEXT, 4, '0'),
  'Member ' || (900 + generate_series),
  'St. Mary''s Cathedral',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  5,
  3,
  2,
  '+91' || (9800000000 + generate_series)::TEXT,
  'member' || (900 + generate_series) || '@stmarys.com',
  md5(random()::text),
  'non_adventist',
  true,  -- All completed
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 60);

-- Holy Trinity Church (50 registrations, 250 people)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-' || LPAD((1100 + generate_series)::TEXT, 4, '0'),
  'Member ' || (1100 + generate_series),
  'Holy Trinity Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  5,
  3,
  2,
  '+91' || (9900000000 + generate_series)::TEXT,
  'member' || (1100 + generate_series) || '@trinity.com',
  md5(random()::text),
  'non_adventist',
  true,  -- All completed
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 50);

-- Remaining churches to reach EXACTLY 2,927 people (1,277 more people needed)
-- 254 registrations × 5 people = 1,270
-- 1 registration × 7 people = 7
-- Total: 255 registrations = 1,277 people
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  'BE-' || LPAD((1500 + generate_series)::TEXT, 4, '0'),
  'Member ' || (1500 + generate_series),
  (ARRAY[
    'Bethel Church',
    'Grace Fellowship',
    'Faith Assembly',
    'Hope Church',
    'Victory Church',
    'Emmanuel Church',
    'Calvary Chapel',
    'New Life Church',
    'Cornerstone Church',
    'Harvest Church'
  ])[1 + (generate_series % 10)],
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series = 255 THEN 7 ELSE 5 END,
  CASE WHEN generate_series = 255 THEN 4 ELSE 3 END,
  CASE WHEN generate_series = 255 THEN 3 ELSE 2 END,
  '+91' || (8000000000 + generate_series)::TEXT,
  'member' || (1500 + generate_series) || '@church.com',
  md5(random()::text),
  CASE WHEN generate_series % 10 = 0 THEN 'non_adventist' ELSE 'adventist' END,
  true,  -- All completed
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 255);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT '=== FINAL VERIFICATION ===' as section;

SELECT 
  'URL People Count' as metric,
  SUM(total_people) as count
FROM registrations
WHERE registration_number NOT LIKE '%QR%';

SELECT 
  'QR Registration Count' as metric,
  COUNT(*) as count
FROM registrations
WHERE registration_number LIKE '%QR%';

SELECT 
  'Total Registrations' as metric,
  COUNT(*) as count
FROM registrations;

SELECT 
  'By Church' as section,
  church_name,
  COUNT(*) as registrations,
  SUM(total_people) as people
FROM registrations
WHERE registration_number NOT LIKE '%QR%'
GROUP BY church_name
ORDER BY people DESC;

-- Made with Bob
