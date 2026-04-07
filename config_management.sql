-- Configuration Management System
-- This allows admins to modify exhibition settings without code changes

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

-- Create index
CREATE INDEX idx_site_config_key ON site_config(config_key);
CREATE INDEX idx_site_config_category ON site_config(category);

-- Insert default configuration values
INSERT INTO site_config (config_key, config_value, config_type, description, category, is_editable) VALUES
  -- Exhibition Info
  ('exhibition_name', 'Bible Exhibition', 'string', 'Name of the exhibition', 'general', true),
  ('exhibition_description', 'Experience the Bible through interactive exhibits', 'string', 'Short description', 'general', true),
  ('contact_email', 'info@bibleexhibition.com', 'string', 'Contact email', 'general', true),
  ('contact_phone', '+1234567890', 'string', 'Contact phone number', 'general', true),
  
  -- Capacity Settings
  ('default_batch_size', '10', 'number', 'Default number of people per batch', 'capacity', true),
  ('slot_duration_minutes', '20', 'number', 'Duration of each time slot in minutes', 'capacity', true),
  ('max_group_size', '50', 'number', 'Maximum people allowed per registration', 'capacity', true),
  
  -- Schedule Settings - Weekend (Saturday & Sunday)
  ('weekend_start_time', '09:00:00', 'time', 'Weekend exhibition start time', 'schedule', true),
  ('weekend_end_time', '20:00:00', 'time', 'Weekend exhibition end time', 'schedule', true),
  ('weekend_enabled', 'true', 'boolean', 'Enable weekend exhibitions', 'schedule', true),
  
  -- Schedule Settings - Friday
  ('friday_start_time', '18:00:00', 'time', 'Friday exhibition start time', 'schedule', true),
  ('friday_end_time', '21:00:00', 'time', 'Friday exhibition end time', 'schedule', true),
  ('friday_enabled', 'true', 'boolean', 'Enable Friday exhibitions', 'schedule', true),
  
  -- Schedule Settings - Weekday
  ('weekday_enabled', 'false', 'boolean', 'Enable weekday exhibitions', 'schedule', true),
  ('weekday_start_time', '09:00:00', 'time', 'Weekday exhibition start time', 'schedule', true),
  ('weekday_end_time', '17:00:00', 'time', 'Weekday exhibition end time', 'schedule', true),
  
  -- Special Day Settings (for Sabbath, etc.)
  ('saturday_is_sabbath', 'false', 'boolean', 'If true, Saturday starts at custom time', 'schedule', true),
  ('saturday_sabbath_start_time', '12:30:00', 'time', 'Saturday start time if Sabbath', 'schedule', true),
  
  -- UI Content
  ('home_welcome_title', 'Welcome to Bible Exhibition Registration', 'string', 'Home page title', 'content', true),
  ('home_welcome_message', 'Register your group for an inspiring journey through the Bible', 'string', 'Home page message', 'content', true),
  ('registration_instructions', 'Please fill in all required fields to complete your registration', 'string', 'Registration form instructions', 'content', true),
  ('confirmation_message', 'Thank you for registering! Please save your confirmation details.', 'string', 'Confirmation page message', 'content', true),
  
  -- Important Instructions
  ('instruction_arrival_time', 'Please arrive 10 minutes before your scheduled time', 'string', 'Arrival instruction', 'instructions', true),
  ('instruction_save_confirmation', 'Save this confirmation on your mobile device or take a screenshot', 'string', 'Save confirmation instruction', 'instructions', true),
  ('instruction_show_qr', 'Show your registration number or QR code at entry', 'string', 'QR code instruction', 'instructions', true),
  ('instruction_audio_guide', 'Audio guides will be provided in your selected language', 'string', 'Audio guide instruction', 'instructions', true),
  ('instruction_batch_sequence', 'Your group has been split into {batch_count} batches. Call each batch in the numbered order shown above at their designated times. Each batch should arrive 10 minutes before their scheduled time.', 'string', 'Batch sequence instruction (use {batch_count} as placeholder)', 'instructions', true),
  
  -- Admin Settings
  ('admin_password', 'admin123', 'string', 'Admin password for check-ins', 'admin', true),
  ('enable_registration', 'true', 'boolean', 'Enable/disable new registrations', 'admin', true),
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'admin', true),
  ('maintenance_message', 'System is under maintenance. Please check back later.', 'string', 'Maintenance mode message', 'admin', true)
ON CONFLICT (config_key) DO NOTHING;

-- Function to get config value
CREATE OR REPLACE FUNCTION get_config(key VARCHAR)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT config_value INTO result FROM site_config WHERE config_key = key;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update config value
CREATE OR REPLACE FUNCTION update_config(key VARCHAR, value TEXT, updated_by_user VARCHAR DEFAULT 'system')
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE site_config 
  SET config_value = value, 
      updated_at = NOW(),
      updated_by = updated_by_user
  WHERE config_key = key AND is_editable = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON site_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View config by category
SELECT 
  category,
  config_key,
  config_value,
  config_type,
  description,
  is_editable
FROM site_config
ORDER BY category, config_key;

-- Made with Bob
