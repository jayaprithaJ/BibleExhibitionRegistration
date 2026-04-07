// Bible Exhibition Registration System - Type Definitions

export interface Registration {
  id: string;
  registration_number: string;
  name: string;
  church_name: string;
  preferred_date: string;
  total_people: number;
  tamil_count: number;
  english_count: number;
  phone?: string;
  email?: string;
  qr_token: string;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: string;
  slot_date: string;
  slot_time: string;
  language: 'tamil' | 'english';
  capacity: number;
  filled: number;
  status: 'available' | 'filling' | 'full';
  created_at: string;
}

export interface SlotAssignment {
  id: string;
  registration_id: string;
  slot_id: string;
  people_count: number;
  language: 'tamil' | 'english';
  group_sequence: number;
  created_at: string;
}

export interface ExhibitionSchedule {
  id: string;
  exhibition_date: string;
  day_type: 'weekday' | 'friday' | 'weekend' | 'closed';
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
  capacity_override: number | null;
  notes: string | null;
  created_at: string;
}

export interface ExhibitionConfig {
  id: string;
  start_date: string;
  end_date: string;
  slot_duration_minutes: number;
  batch_size: number;
  is_active: boolean;
  created_at: string;
}

// API Request/Response Types

export interface RegistrationInput {
  name: string;
  churchName: string;
  preferredDate: string;
  totalPeople: number;
  tamilCount: number;
  englishCount: number;
  phone?: string;
  email?: string;
}

export interface SlotInfo {
  date: string;
  time: string;
  slotId: string;
  peopleCount: number;
}

export interface AllocationResult {
  success: boolean;
  registrationNumber?: string;
  assignments?: {
    tamil?: SlotInfo[];
    english?: SlotInfo[];
  };
  waitTimeBetweenSlots?: number;
  error?: string;
  errorCode?: string;
  alternativeDates?: DateAvailability[];
}

export interface DateAvailability {
  date: string;
  dayType: string;
  hours: string;
  tamilCapacity: number;
  englishCapacity: number;
  fillPercentage: number;
  status: 'available' | 'filling' | 'full';
}

export interface DateInfo {
  date: string;
  dayType: string;
  hours: string;
  availability: number;
  fillPercentage: number;
  isActive: boolean;
}

export interface AvailabilityCheck {
  hasCapacity: boolean;
  tamilAvailable: number;
  englishAvailable: number;
  reason?: string;
}

// Admin Types

export interface AdminStats {
  totalRegistrations: number;
  todayRegistrations: number;
  totalCapacity: number;
  filledCapacity: number;
  fillPercentage: number;
  upcomingSlots: number;
}

export interface RegistrationWithSlots extends Registration {
  slots: {
    tamil?: SlotInfo;
    english?: SlotInfo;
  };
}

// Made with Bob
