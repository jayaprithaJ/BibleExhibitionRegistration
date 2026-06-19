-- Complete Registration Summary Query
-- Shows total registrations, completed, pending, and people counts

SELECT '=== OVERALL SUMMARY ===' as section;

-- Total registrations and people
SELECT 
  'Total Registrations' as metric,
  COUNT(*) as count,
  SUM(total_people) as total_people
FROM registrations;

-- Completed vs Pending
SELECT 
  CASE WHEN checked_in THEN 'Completed' ELSE 'Pending' END as status,
  COUNT(*) as registration_count,
  SUM(total_people) as people_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM registrations), 1) as percentage_of_registrations,
  ROUND(SUM(total_people) * 100.0 / (SELECT SUM(total_people) FROM registrations), 1) as percentage_of_people
FROM registrations
GROUP BY checked_in
ORDER BY checked_in DESC;

SELECT '=== BY REGISTRATION TYPE ===' as section;

-- URL vs QR breakdown
SELECT 
  CASE 
    WHEN registration_number LIKE '%QR%' THEN 'QR Code'
    ELSE 'URL'
  END as registration_type,
  COUNT(*) as registration_count,
  SUM(total_people) as people_count,
  SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as completed_registrations,
  SUM(CASE WHEN NOT checked_in THEN 1 ELSE 0 END) as pending_registrations,
  SUM(CASE WHEN checked_in THEN total_people ELSE 0 END) as completed_people,
  SUM(CASE WHEN NOT checked_in THEN total_people ELSE 0 END) as pending_people
FROM registrations
GROUP BY CASE WHEN registration_number LIKE '%QR%' THEN 'QR Code' ELSE 'URL' END
ORDER BY registration_type;

SELECT '=== BY VISITOR TYPE ===' as section;

-- Adventist vs Non-Adventist
SELECT 
  COALESCE(visitor_type, 'adventist') as visitor_type,
  COUNT(*) as registration_count,
  SUM(total_people) as people_count,
  ROUND(SUM(total_people) * 100.0 / (SELECT SUM(total_people) FROM registrations), 1) as percentage,
  SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as completed_registrations,
  SUM(CASE WHEN NOT checked_in THEN 1 ELSE 0 END) as pending_registrations
FROM registrations
GROUP BY visitor_type
ORDER BY people_count DESC;

SELECT '=== BY DATE ===' as section;

-- Breakdown by preferred date
SELECT 
  preferred_date,
  COUNT(*) as registration_count,
  SUM(total_people) as people_count,
  SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as completed_registrations,
  SUM(CASE WHEN NOT checked_in THEN 1 ELSE 0 END) as pending_registrations,
  SUM(CASE WHEN checked_in THEN total_people ELSE 0 END) as completed_people,
  SUM(CASE WHEN NOT checked_in THEN total_people ELSE 0 END) as pending_people,
  ROUND(SUM(CASE WHEN checked_in THEN total_people ELSE 0 END) * 100.0 / NULLIF(SUM(total_people), 0), 1) as completion_percentage
FROM registrations
GROUP BY preferred_date
ORDER BY preferred_date;

SELECT '=== BY CHURCH (TOP 15) ===' as section;

-- Top churches by people count
SELECT 
  church_name,
  COUNT(*) as registration_count,
  SUM(total_people) as people_count,
  SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as completed_registrations,
  SUM(CASE WHEN NOT checked_in THEN 1 ELSE 0 END) as pending_registrations,
  ROUND(SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as completion_percentage
FROM registrations
GROUP BY church_name
ORDER BY people_count DESC
LIMIT 15;

SELECT '=== LANGUAGE BREAKDOWN ===' as section;

-- Tamil vs English preference
SELECT 
  'Tamil Speakers' as language,
  SUM(tamil_count) as total_count,
  ROUND(SUM(tamil_count) * 100.0 / (SELECT SUM(total_people) FROM registrations), 1) as percentage
FROM registrations
UNION ALL
SELECT 
  'English Speakers' as language,
  SUM(english_count) as total_count,
  ROUND(SUM(english_count) * 100.0 / (SELECT SUM(total_people) FROM registrations), 1) as percentage
FROM registrations
ORDER BY total_count DESC;

SELECT '=== QUICK STATS ===' as section;

-- Quick one-line stats
SELECT 
  (SELECT COUNT(*) FROM registrations) as total_registrations,
  (SELECT SUM(total_people) FROM registrations) as total_people,
  (SELECT COUNT(*) FROM registrations WHERE checked_in = true) as completed_registrations,
  (SELECT COUNT(*) FROM registrations WHERE checked_in = false) as pending_registrations,
  (SELECT SUM(total_people) FROM registrations WHERE checked_in = true) as completed_people,
  (SELECT SUM(total_people) FROM registrations WHERE checked_in = false) as pending_people,
  (SELECT COUNT(*) FROM registrations WHERE registration_number LIKE '%QR%') as qr_registrations,
  (SELECT SUM(total_people) FROM registrations WHERE registration_number NOT LIKE '%QR%') as url_people;

-- Made with Bob
