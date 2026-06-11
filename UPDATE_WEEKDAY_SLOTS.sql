-- Update Monday to Thursday to have evening slots (5 PM - 9 PM)
-- This will enable slot creation for these weekdays

-- WEEK 1: June 8-11 (Monday-Thursday)
-- Update Monday June 8
UPDATE exhibition_schedule
SET day_type = 'weekday',
    start_time = '17:00:00',
    end_time = '21:00:00',
    is_active = true
WHERE exhibition_date = '2026-06-08';

-- Update Tuesday June 9
UPDATE exhibition_schedule
SET day_type = 'weekday',
    start_time = '17:00:00',
    end_time = '21:00:00',
    is_active = true
WHERE exhibition_date = '2026-06-09';

-- Update Wednesday June 10
UPDATE exhibition_schedule
SET day_type = 'weekday',
    start_time = '17:00:00',
    end_time = '21:00:00',
    is_active = true
WHERE exhibition_date = '2026-06-10';

-- Update Thursday June 11
UPDATE exhibition_schedule
SET day_type = 'weekday',
    start_time = '17:00:00',
    end_time = '21:00:00',
    is_active = true
WHERE exhibition_date = '2026-06-11';

-- WEEK 2: June 15-18 (Monday-Thursday)
-- Update Monday June 15
UPDATE exhibition_schedule
SET day_type = 'weekday',
    start_time = '17:00:00',
    end_time = '21:00:00',
    is_active = true
WHERE exhibition_date = '2026-06-15';

-- Update Tuesday June 16
UPDATE exhibition_schedule
SET day_type = 'weekday',
    start_time = '17:00:00',
    end_time = '21:00:00',
    is_active = true
WHERE exhibition_date = '2026-06-16';

-- Update Wednesday June 17
UPDATE exhibition_schedule
SET day_type = 'weekday',
    start_time = '17:00:00',
    end_time = '21:00:00',
    is_active = true
WHERE exhibition_date = '2026-06-17';

-- Update Thursday June 18
UPDATE exhibition_schedule
SET day_type = 'weekday',
    start_time = '17:00:00',
    end_time = '21:00:00',
    is_active = true
WHERE exhibition_date = '2026-06-18';

-- Now initialize slots for these updated dates
-- This will create the 5 PM - 9 PM time slots
SELECT initialize_exhibition_slots();

-- Verify the changes
SELECT 
    exhibition_date,
    day_type,
    start_time,
    end_time,
    is_active
FROM exhibition_schedule
WHERE day_type = 'weekday'
ORDER BY exhibition_date;

-- Check created slots
SELECT
    slot_date,
    COUNT(*) as total_slots,
    SUM(capacity) as total_capacity
FROM slots
WHERE slot_date IN ('2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18')
GROUP BY slot_date
ORDER BY slot_date;

-- Made with Bob
