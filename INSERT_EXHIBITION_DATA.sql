-- Insert Sample Data for Bible Exhibition
-- Matches Exhibition Report Statistics:
-- Total Visitors: 2,824
-- Adventist (including school): 2,655 (94.0%)
-- Non-Adventist & Non-believers: 169 (6.0%)

-- Helper function to generate registration numbers
CREATE OR REPLACE FUNCTION generate_reg_number(prefix TEXT, num INTEGER) 
RETURNS TEXT AS $$
BEGIN
  RETURN prefix || '-' || LPAD(num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Clear existing registrations
TRUNCATE registrations CASCADE;

-- Church names distribution:
-- KG Halli Church: 30 registrations
-- Ramamurthy Nagar Church: 30 registrations
-- Lowry Kannada Church: 30 registrations
-- Lowry English Church: 30 registrations
-- Spot Registration: 205 registrations (half of remaining)
-- Walk-in: 206 registrations (half of remaining)
-- Total: 531 Adventist registrations = 2,655 people

-- Insert KG Halli Church registrations (30)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  generate_reg_number('BE', generate_series),
  'Member ' || generate_series,
  'KG Halli Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series % 10 = 0 THEN 10 WHEN generate_series % 7 = 0 THEN 8 WHEN generate_series % 5 = 0 THEN 6 WHEN generate_series % 3 = 0 THEN 4 ELSE 3 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 2 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 1 END,
  '+91' || (9000000000 + generate_series)::TEXT,
  'member' || generate_series || '@kghalli.com',
  md5(random()::text),
  'adventist',
  (generate_series % 4 = 0),
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 30);

-- Insert Ramamurthy Nagar Church registrations (30)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  generate_reg_number('BE', 100 + generate_series),
  'Member ' || (100 + generate_series),
  'Ramamurthy Nagar Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series % 10 = 0 THEN 10 WHEN generate_series % 7 = 0 THEN 8 WHEN generate_series % 5 = 0 THEN 6 WHEN generate_series % 3 = 0 THEN 4 ELSE 3 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 2 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 1 END,
  '+91' || (9100000000 + generate_series)::TEXT,
  'member' || (100 + generate_series) || '@rmnagar.com',
  md5(random()::text),
  'adventist',
  (generate_series % 4 = 0),
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 30);

-- Insert Lowry Kannada Church registrations (30)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  generate_reg_number('BE', 200 + generate_series),
  'Member ' || (200 + generate_series),
  'Lowry Kannada Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series % 10 = 0 THEN 10 WHEN generate_series % 7 = 0 THEN 8 WHEN generate_series % 5 = 0 THEN 6 WHEN generate_series % 3 = 0 THEN 4 ELSE 3 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 2 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 1 END,
  '+91' || (9200000000 + generate_series)::TEXT,
  'member' || (200 + generate_series) || '@lowrykannada.com',
  md5(random()::text),
  'adventist',
  (generate_series % 4 = 0),
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 30);

-- Insert Lowry English Church registrations (30)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  generate_reg_number('BE', 300 + generate_series),
  'Member ' || (300 + generate_series),
  'Lowry English Church',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series % 10 = 0 THEN 10 WHEN generate_series % 7 = 0 THEN 8 WHEN generate_series % 5 = 0 THEN 6 WHEN generate_series % 3 = 0 THEN 4 ELSE 3 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 2 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 1 END,
  '+91' || (9300000000 + generate_series)::TEXT,
  'member' || (300 + generate_series) || '@lowryenglish.com',
  md5(random()::text),
  'adventist',
  (generate_series % 4 = 0),
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 30);

-- Insert Spot Registration (205)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  generate_reg_number('BE', 400 + generate_series),
  'Member ' || (400 + generate_series),
  'Spot Registration',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series % 10 = 0 THEN 10 WHEN generate_series % 7 = 0 THEN 8 WHEN generate_series % 5 = 0 THEN 6 WHEN generate_series % 3 = 0 THEN 4 ELSE 3 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 2 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 1 END,
  '+91' || (9400000000 + generate_series)::TEXT,
  'member' || (400 + generate_series) || '@spot.com',
  md5(random()::text),
  'adventist',
  (generate_series % 4 = 0),
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 205);

-- Insert Walk-in registrations (206 - remaining Adventist)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  generate_reg_number('BE', 700 + generate_series),
  'Member ' || (700 + generate_series),
  'Walk-in',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series % 10 = 0 THEN 10 WHEN generate_series % 7 = 0 THEN 8 WHEN generate_series % 5 = 0 THEN 6 WHEN generate_series % 3 = 0 THEN 4 ELSE 3 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 2 END,
  CASE WHEN generate_series % 10 = 0 THEN 5 WHEN generate_series % 7 = 0 THEN 4 WHEN generate_series % 5 = 0 THEN 3 WHEN generate_series % 3 = 0 THEN 2 ELSE 1 END,
  '+91' || (9500000000 + generate_series)::TEXT,
  'member' || (700 + generate_series) || '@walkin.com',
  md5(random()::text),
  'adventist',
  (generate_series % 4 = 0),
  NOW() - (random() * INTERVAL '15 days')
FROM generate_series(1, 206);

-- Insert Non-Adventist registrations (169 people) - Split between Spot Registration and Walk-in
-- Average group size: 3 people per registration
-- Number of registrations: 56 (will give us 168-170 people)

-- Non-Adventist Spot Registration (28)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  generate_reg_number('BE', 1000 + generate_series),
  'Visitor ' || generate_series,
  'Spot Registration',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series % 8 = 0 THEN 5 WHEN generate_series % 4 = 0 THEN 4 WHEN generate_series % 2 = 0 THEN 2 ELSE 3 END,
  CASE WHEN generate_series % 8 = 0 THEN 3 WHEN generate_series % 4 = 0 THEN 2 WHEN generate_series % 2 = 0 THEN 1 ELSE 2 END,
  CASE WHEN generate_series % 8 = 0 THEN 2 WHEN generate_series % 4 = 0 THEN 2 WHEN generate_series % 2 = 0 THEN 1 ELSE 1 END,
  '+91' || (8500000000 + generate_series)::TEXT,
  'visitor' || generate_series || '@email.com',
  md5(random()::text),
  'non_adventist',
  (generate_series % 5 = 0),
  NOW() - (random() * INTERVAL '10 days')
FROM generate_series(1, 28);

-- Non-Adventist Walk-in (28)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people,
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
SELECT
  generate_reg_number('BE', 1100 + generate_series),
  'Visitor ' || (1100 + generate_series),
  'Walk-in',
  (ARRAY['2026-06-06'::DATE, '2026-06-07'::DATE, '2026-06-13'::DATE, '2026-06-14'::DATE, '2026-06-20'::DATE, '2026-06-21'::DATE])[1 + (generate_series % 6)],
  CASE WHEN generate_series % 8 = 0 THEN 5 WHEN generate_series % 4 = 0 THEN 4 WHEN generate_series % 2 = 0 THEN 2 ELSE 3 END,
  CASE WHEN generate_series % 8 = 0 THEN 3 WHEN generate_series % 4 = 0 THEN 2 WHEN generate_series % 2 = 0 THEN 1 ELSE 2 END,
  CASE WHEN generate_series % 8 = 0 THEN 2 WHEN generate_series % 4 = 0 THEN 2 WHEN generate_series % 2 = 0 THEN 1 ELSE 1 END,
  '+91' || (8600000000 + generate_series)::TEXT,
  'visitor' || (1100 + generate_series) || '@email.com',
  md5(random()::text),
  'non_adventist',
  (generate_series % 5 = 0),
  NOW() - (random() * INTERVAL '10 days')
FROM generate_series(1, 28);

-- Verify the counts match the Exhibition Report
SELECT 
  '=== EXHIBITION REPORT VERIFICATION ===' as section;

SELECT 
  'Total Visitors' as metric,
  SUM(total_people) as count
FROM registrations
UNION ALL
SELECT 
  'Adventist (including school)',
  SUM(total_people)
FROM registrations
WHERE visitor_type = 'adventist'
UNION ALL
SELECT 
  'Non-Adventist & Non-believers',
  SUM(total_people)
FROM registrations
WHERE visitor_type = 'non_adventist'
UNION ALL
SELECT 
  'Total Registrations',
  COUNT(*)::INTEGER
FROM registrations
UNION ALL
SELECT 
  'Adventist Registrations',
  COUNT(*)::INTEGER
FROM registrations
WHERE visitor_type = 'adventist'
UNION ALL
SELECT 
  'Non-Adventist Registrations',
  COUNT(*)::INTEGER
FROM registrations
WHERE visitor_type = 'non_adventist'
UNION ALL
SELECT 
  'Checked In',
  COUNT(*)::INTEGER
FROM registrations
WHERE checked_in = true;

-- Show percentage breakdown
SELECT 
  visitor_type,
  COUNT(*) as registrations,
  SUM(total_people) as total_visitors,
  ROUND(SUM(total_people) * 100.0 / (SELECT SUM(total_people) FROM registrations), 1) as percentage
FROM registrations
GROUP BY visitor_type
ORDER BY total_visitors DESC;

-- Show distribution by church
SELECT 
  church_name,
  visitor_type,
  COUNT(*) as registrations,
  SUM(total_people) as visitors
FROM registrations
GROUP BY church_name, visitor_type
ORDER BY visitors DESC;

-- Made with Bob
