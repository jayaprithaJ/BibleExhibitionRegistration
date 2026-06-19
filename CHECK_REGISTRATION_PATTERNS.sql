-- Check registration number patterns to understand the data

-- 1. Count by registration number pattern
SELECT 
  CASE 
    WHEN registration_number LIKE 'BE-QR-%' THEN 'QR Registrations'
    WHEN registration_number LIKE 'BE-SPOT-%' THEN 'Spot/Walk-in Registrations'
    WHEN registration_number LIKE 'BE-%' THEN 'URL Registrations'
    ELSE 'Other'
  END as registration_type,
  COUNT(*) as registration_count,
  SUM(total_people) as total_people
FROM registrations
GROUP BY 
  CASE 
    WHEN registration_number LIKE 'BE-QR-%' THEN 'QR Registrations'
    WHEN registration_number LIKE 'BE-SPOT-%' THEN 'Spot/Walk-in Registrations'
    WHEN registration_number LIKE 'BE-%' THEN 'URL Registrations'
    ELSE 'Other'
  END
ORDER BY total_people DESC;

-- 2. Show sample registration numbers for each type
(SELECT 'QR Samples' as type, registration_number, total_people
FROM registrations
WHERE registration_number LIKE 'BE-QR-%'
LIMIT 5)
UNION ALL
(SELECT 'SPOT Samples' as type, registration_number, total_people
FROM registrations
WHERE registration_number LIKE 'BE-SPOT-%'
LIMIT 5)
UNION ALL
(SELECT 'URL Samples' as type, registration_number, total_people
FROM registrations
WHERE registration_number LIKE 'BE-%'
  AND registration_number NOT LIKE 'BE-QR-%'
  AND registration_number NOT LIKE 'BE-SPOT-%'
LIMIT 5);

-- 3. Check if there are any registrations with QR in the middle
SELECT 
  registration_number,
  total_people,
  CASE 
    WHEN registration_number LIKE '%QR%' THEN 'Contains QR'
    ELSE 'No QR'
  END as has_qr
FROM registrations
WHERE registration_number LIKE '%QR%'
LIMIT 10;

-- 4. Total summary
SELECT 
  COUNT(*) as total_registrations,
  SUM(total_people) as total_people
FROM registrations;

-- Made with Bob
