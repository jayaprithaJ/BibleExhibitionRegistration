-- Run this SQL in your database to add the configuration management system

-- Create site configuration table
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  config_type VARCHAR(20) NOT NULL CHECK (config_type IN ('string', 'number', 'boolean', 'json', 'time', 'date')),
  description TEXT,
  category VARCHAR(50),
  is_editable BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(255)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(config_key);
CREATE INDEX IF NOT EXISTS idx_site_config_category ON site_config(category);

-- Insert default configuration values
INSERT INTO site_config (config_key, config_value, config_type, description, category, is_editable) VALUES
  ('exhibition_name', 'Bible Exhibition', 'string', 'Name of the exhibition', 'general', true),
  ('weekend_start_time', '09:00:00', 'time', 'Saturday & Sunday start time', 'schedule', true),
  ('weekend_end_time', '20:00:00', 'time', 'Saturday & Sunday end time', 'schedule', true),
  ('friday_start_time', '18:00:00', 'time', 'Friday start time', 'schedule', true),
  ('friday_end_time', '21:00:00', 'time', 'Friday end time', 'schedule', true),
  ('saturday_is_sabbath', 'false', 'boolean', 'If true, Saturday starts at custom time', 'schedule', true),
  ('saturday_sabbath_start_time', '12:30:00', 'time', 'Saturday start time if Sabbath', 'schedule', true),
  ('default_batch_size', '10', 'number', 'Default number of people per batch', 'capacity', true),
  ('slot_duration_minutes', '20', 'number', 'Duration of each time slot in minutes', 'capacity', true),
  ('admin_password', 'admin123', 'string', 'Admin password for check-ins', 'admin', true)
ON CONFLICT (config_key) DO NOTHING;

-- Made with Bob
