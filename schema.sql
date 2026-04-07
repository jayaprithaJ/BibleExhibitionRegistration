-- Bible Exhibition Registration System - Database Schema
-- Version: 2.0
-- Date: 2026-04-07

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS slot_assignments CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS exhibition_schedule CASCADE;
DROP TABLE IF EXISTS exhibition_config CASCADE;

-- 1. Exhibition Configuration
CREATE TABLE exhibition_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 20,
  batch_size INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Exhibition Schedule (Day-specific configuration)
CREATE TABLE exhibition_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_date DATE NOT NULL UNIQUE,
  day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('weekday', 'friday', 'weekend', 'closed')),
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT true,
  capacity_override INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Registrations
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  church_name VARCHAR(255) NOT NULL,
  preferred_date DATE NOT NULL,
  total_people INTEGER NOT NULL CHECK (total_people > 0 AND total_people <= 50),
  tamil_count INTEGER NOT NULL CHECK (tamil_count >= 0),
  english_count INTEGER NOT NULL CHECK (english_count >= 0),
  phone VARCHAR(20),
  email VARCHAR(255),
  qr_token VARCHAR(64) UNIQUE NOT NULL,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_split CHECK (tamil_count + english_count = total_people),
  CONSTRAINT at_least_one_language CHECK (tamil_count > 0 OR english_count > 0)
);

-- 4. Slots
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  language VARCHAR(10) NOT NULL CHECK (language IN ('tamil', 'english')),
  capacity INTEGER DEFAULT 10,
  filled INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'filling', 'full')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(slot_date, slot_time, language)
);

-- 5. Slot Assignments
CREATE TABLE slot_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  people_count INTEGER NOT NULL,
  language VARCHAR(10) NOT NULL,
  group_sequence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(registration_id, slot_id)
);

-- Create indexes for performance
CREATE INDEX idx_registrations_created ON registrations(created_at);
CREATE INDEX idx_registrations_church ON registrations(church_name);
CREATE INDEX idx_registrations_date ON registrations(preferred_date);
CREATE INDEX idx_registrations_qr_token ON registrations(qr_token);
CREATE INDEX idx_registrations_checked_in ON registrations(checked_in);
CREATE INDEX idx_schedule_date ON exhibition_schedule(exhibition_date);
CREATE INDEX idx_schedule_active ON exhibition_schedule(is_active);
CREATE INDEX idx_slots_date_time ON slots(slot_date, slot_time);
CREATE INDEX idx_slots_date_time_lang ON slots(slot_date, slot_time, language);
CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_slots_language ON slots(language);
CREATE INDEX idx_slots_date_lang_status ON slots(slot_date, language, status);
CREATE INDEX idx_assignments_registration ON slot_assignments(registration_id);
CREATE INDEX idx_assignments_slot ON slot_assignments(slot_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert exhibition config
INSERT INTO exhibition_config (
  start_date,
  end_date,
  slot_duration_minutes,
  batch_size,
  is_active
) VALUES (
  '2026-06-05',
  '2026-06-21',
  20,
  10,
  true
);

-- Insert exhibition schedule
-- June 2026 Calendar: Fri 5, Sat 6, Sun 7, Mon 8, Tue 9, Wed 10, Thu 11, Fri 12, Sat 13, Sun 14, Mon 15, Tue 16, Wed 17, Thu 18, Fri 19, Sat 20, Sun 21

-- Fridays (Jun 5, 12, 19)
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-05', 'friday', '18:00:00', '21:00:00', true),
  ('2026-06-12', 'friday', '18:00:00', '21:00:00', true),
  ('2026-06-19', 'friday', '18:00:00', '21:00:00', true);

-- Saturdays (Jun 6, 13, 20)
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-06', 'weekend', '09:00:00', '20:00:00', true),
  ('2026-06-13', 'weekend', '09:00:00', '20:00:00', true),
  ('2026-06-20', 'weekend', '09:00:00', '20:00:00', true);

-- Sundays (Jun 7, 14, 21)
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-07', 'weekend', '09:00:00', '20:00:00', true),
  ('2026-06-14', 'weekend', '09:00:00', '20:00:00', true),
  ('2026-06-21', 'weekend', '09:00:00', '20:00:00', true);

-- Weekdays - Initially closed
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-08', 'closed', NULL, NULL, false),
  ('2026-06-09', 'closed', NULL, NULL, false),
  ('2026-06-10', 'closed', NULL, NULL, false),
  ('2026-06-11', 'closed', NULL, NULL, false),
  ('2026-06-15', 'closed', NULL, NULL, false),
  ('2026-06-16', 'closed', NULL, NULL, false),
  ('2026-06-17', 'closed', NULL, NULL, false),
  ('2026-06-18', 'closed', NULL, NULL, false);

-- Function to initialize slots
CREATE OR REPLACE FUNCTION initialize_exhibition_slots()
RETURNS void AS $$
DECLARE
  config RECORD;
  schedule RECORD;
  v_slot_time TIME;
  v_end_time TIME;
BEGIN
  -- Get exhibition config
  SELECT * INTO config FROM exhibition_config WHERE is_active = true LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active exhibition configuration found';
  END IF;
  
  -- Loop through each active day in schedule
  FOR schedule IN
    SELECT * FROM exhibition_schedule
    WHERE is_active = true
      AND day_type != 'closed'
      AND start_time IS NOT NULL
    ORDER BY exhibition_date
  LOOP
    -- Loop through time slots for the day
    v_slot_time := schedule.start_time;
    v_end_time := schedule.end_time;
    
    WHILE v_slot_time < v_end_time LOOP
      -- Create Tamil slot
      INSERT INTO slots (slot_date, slot_time, language, capacity, filled, status)
      VALUES (schedule.exhibition_date, v_slot_time, 'tamil', config.batch_size, 0, 'available')
      ON CONFLICT (slot_date, slot_time, language) DO NOTHING;
      
      -- Create English slot
      INSERT INTO slots (slot_date, slot_time, language, capacity, filled, status)
      VALUES (schedule.exhibition_date, v_slot_time, 'english', config.batch_size, 0, 'available')
      ON CONFLICT (slot_date, slot_time, language) DO NOTHING;
      
      -- Move to next time slot
      v_slot_time := v_slot_time + (config.slot_duration_minutes || ' minutes')::INTERVAL;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Slots initialized successfully';
END;
$$ LANGUAGE plpgsql;

-- Initialize slots
SELECT initialize_exhibition_slots();

-- Verify setup
SELECT 
  'Exhibition Config' as table_name,
  COUNT(*) as count
FROM exhibition_config
UNION ALL
SELECT 
  'Exhibition Schedule',
  COUNT(*)
FROM exhibition_schedule
UNION ALL
SELECT 
  'Slots',
  COUNT(*)
FROM slots
UNION ALL
SELECT 
  'Active Dates',
  COUNT(*)
FROM exhibition_schedule
WHERE is_active = true AND day_type != 'closed';

-- Show slot summary
SELECT 
  slot_date,
  language,
  COUNT(*) as total_slots,
  SUM(capacity) as total_capacity
FROM slots
GROUP BY slot_date, language
ORDER BY slot_date, language;

-- Made with Bob
