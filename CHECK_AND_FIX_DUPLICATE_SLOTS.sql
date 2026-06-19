-- Check for duplicate slots and abnormal capacities
-- This will help identify why June 6 and 7 have such high numbers

-- 1. Check total slots per date
SELECT 
    slot_date,
    language,
    COUNT(*) as slot_count,
    SUM(capacity) as total_capacity,
    SUM(filled) as total_filled
FROM slots
WHERE slot_date IN ('2026-06-06', '2026-06-07', '2026-06-13', '2026-06-14')
GROUP BY slot_date, language
ORDER BY slot_date, language;

-- 2. Check for duplicate time slots (same date, time, language)
SELECT 
    slot_date,
    slot_time,
    language,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as slot_ids
FROM slots
WHERE slot_date IN ('2026-06-06', '2026-06-07')
GROUP BY slot_date, slot_time, language
HAVING COUNT(*) > 1
ORDER BY slot_date, slot_time, language;

-- 3. Check exhibition schedule configuration
SELECT 
    exhibition_date,
    day_type,
    start_time,
    end_time,
    is_active,
    EXTRACT(EPOCH FROM (end_time - start_time))/3600 as hours,
    EXTRACT(EPOCH FROM (end_time - start_time))/3600 * 3 as expected_slots_per_language
FROM exhibition_schedule
WHERE exhibition_date IN ('2026-06-06', '2026-06-07', '2026-06-13', '2026-06-14')
ORDER BY exhibition_date;

-- 4. Check batch size configuration
SELECT * FROM exhibition_config WHERE is_active = true;

-- OPTIONAL: If duplicates found, uncomment below to delete them
-- This keeps only the oldest slot for each (date, time, language) combination

/*
-- DELETE DUPLICATES (UNCOMMENT TO RUN)
DELETE FROM slots
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY slot_date, slot_time, language 
                   ORDER BY created_at ASC
               ) as rn
        FROM slots
        WHERE slot_date IN ('2026-06-06', '2026-06-07')
    ) t
    WHERE t.rn > 1
);

-- After deleting duplicates, verify the counts
SELECT 
    slot_date,
    language,
    COUNT(*) as slot_count,
    SUM(capacity) as total_capacity
FROM slots
WHERE slot_date IN ('2026-06-06', '2026-06-07')
GROUP BY slot_date, language
ORDER BY slot_date, language;
*/

-- Made with Bob
