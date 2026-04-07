# Bible Exhibition Registration System - Final Requirements Document

**Version**: 2.0 (Updated)  
**Last Updated**: April 7, 2026  
**Exhibition Dates**: June 5-21, 2026  
**Status**: Ready for Implementation

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Exhibition Schedule](#exhibition-schedule)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Slot Allocation Algorithm](#slot-allocation-algorithm)
6. [User Interface Design](#user-interface-design)
7. [API Specifications](#api-specifications)
8. [Implementation Guide](#implementation-guide)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Plan](#deployment-plan)

---

## 1. Project Overview

### Purpose
Digital registration system for Bible Exhibition with intelligent slot allocation and date selection.

### Key Features
- ✅ QR code-based registration access
- ✅ Date selection with real-time availability
- ✅ Smart consecutive slot allocation for mixed language groups
- ✅ Alternative date suggestions when preferred date is full
- ✅ Admin dashboard with schedule management
- ✅ Real-time capacity monitoring

### Exhibition Details
- **Dates**: June 5-21, 2026 (17 days)
- **Languages**: Tamil & English (separate audio tracks)
- **Batch Size**: 10 people per slot per language
- **Slot Duration**: 20 minutes
- **Expected Visitors**: 300-500 per day

### Operating Schedule

#### Confirmed Operating Days
| Day Type | Dates | Hours | Slots/Day | Capacity/Day |
|----------|-------|-------|-----------|--------------|
| **Saturdays** | Jun 7, 14, 21 | 9 AM - 8 PM | 33 | 660 |
| **Sundays** | Jun 8, 15 | 9 AM - 8 PM | 33 | 660 |
| **Fridays** | Jun 6, 13, 20 | 6 PM - 9 PM | 9 | 180 |

#### Flexible Days (Booking-Dependent)
- **Weekdays (Mon-Thu)**: Jun 9-12, 16-19 - Initially closed, can be activated based on demand
- **Opening Day**: Jun 5 (Thursday) - TBD

#### Total Capacity
- **Confirmed**: 3,840 people (8 operating days)
- **Potential**: 9,240 people (if all weekdays open)

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (Free tier)
- **Validation**: Zod
- **Forms**: React Hook Form
- **Cost**: $0/month (all free tiers)

---

## 2. Exhibition Schedule

### Schedule Configuration

```sql
-- Exhibition schedule with flexible day-specific configuration
CREATE TABLE exhibition_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_date DATE NOT NULL UNIQUE,
  day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('weekday', 'friday', 'weekend', 'closed')),
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT true,
  capacity_override INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Initial Schedule Data

```sql
-- Saturdays (Jun 7, 14, 21)
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-07', 'weekend', '09:00:00', '20:00:00', true),
  ('2026-06-14', 'weekend', '09:00:00', '20:00:00', true),
  ('2026-06-21', 'weekend', '09:00:00', '20:00:00', true);

-- Sundays (Jun 8, 15)
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-08', 'weekend', '09:00:00', '20:00:00', true),
  ('2026-06-15', 'weekend', '09:00:00', '20:00:00', true);

-- Fridays (Jun 6, 13, 20)
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-06', 'friday', '18:00:00', '21:00:00', true),
  ('2026-06-13', 'friday', '18:00:00', '21:00:00', true),
  ('2026-06-20', 'friday', '18:00:00', '21:00:00', true);

-- Opening day (Jun 5) - TBD
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-05', 'closed', NULL, NULL, false);

-- Weekdays - Initially closed
INSERT INTO exhibition_schedule (exhibition_date, day_type, start_time, end_time, is_active) VALUES
  ('2026-06-09', 'closed', NULL, NULL, false),
  ('2026-06-10', 'closed', NULL, NULL, false),
  ('2026-06-11', 'closed', NULL, NULL, false),
  ('2026-06-12', 'closed', NULL, NULL, false),
  ('2026-06-16', 'closed', NULL, NULL, false),
  ('2026-06-17', 'closed', NULL, NULL, false),
  ('2026-06-18', 'closed', NULL, NULL, false),
  ('2026-06-19', 'closed', NULL, NULL, false);
```

---

## 3. System Architecture

### Architecture Pattern
Serverless JAMstack with Next.js 14

```
┌─────────────────────────────────────────────────────────────┐
│                         USER LAYER                          │
│  QR Code → Mobile Browser → Registration Form               │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│  • Next.js 14 (App Router)                                  │
│  • React 18 with TypeScript                                 │
│  • TailwindCSS + shadcn/ui                                  │
│  • Date Picker with Availability                            │
│  • Deployed on Vercel (Free tier)                           │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                             │
│  • POST /api/register - Create registration                 │
│  • GET /api/dates/available - Get available dates           │
│  • GET /api/dates/:date/availability - Check date capacity  │
│  • GET /api/admin/schedule - Manage schedule                │
│  • Rate limiting with Upstash Redis                         │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                          │
│  • Supabase (PostgreSQL)                                    │
│  • Tables: registrations, slots, slot_assignments,          │
│            exhibition_config, exhibition_schedule           │
│  • Row Level Security (RLS)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### Complete Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Exhibition Configuration
CREATE TABLE exhibition_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 20,
  batch_size INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Exhibition Schedule (Day-specific configuration)
CREATE TABLE exhibition_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  church_name VARCHAR(255) NOT NULL,
  preferred_date DATE NOT NULL,
  total_people INTEGER NOT NULL CHECK (total_people > 0 AND total_people <= 50),
  tamil_count INTEGER NOT NULL CHECK (tamil_count >= 0),
  english_count INTEGER NOT NULL CHECK (english_count >= 0),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_split CHECK (tamil_count + english_count = total_people),
  CONSTRAINT at_least_one_language CHECK (tamil_count > 0 OR english_count > 0)
);

-- 4. Slots
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  people_count INTEGER NOT NULL,
  language VARCHAR(10) NOT NULL,
  group_sequence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(registration_id, language)
);

-- Indexes for performance
CREATE INDEX idx_registrations_created ON registrations(created_at);
CREATE INDEX idx_registrations_church ON registrations(church_name);
CREATE INDEX idx_registrations_date ON registrations(preferred_date);
CREATE INDEX idx_schedule_date ON exhibition_schedule(exhibition_date);
CREATE INDEX idx_schedule_active ON exhibition_schedule(is_active);
CREATE INDEX idx_slots_date_time ON slots(slot_date, slot_time);
CREATE INDEX idx_slots_date_time_lang ON slots(slot_date, slot_time, language);
CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_slots_language ON slots(language);
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
```

### Slot Initialization Function

```sql
CREATE OR REPLACE FUNCTION initialize_exhibition_slots()
RETURNS void AS $$
DECLARE
  config RECORD;
  schedule RECORD;
  current_time TIME;
  end_time TIME;
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
    current_time := schedule.start_time;
    end_time := schedule.end_time;
    
    WHILE current_time < end_time LOOP
      -- Create Tamil slot
      INSERT INTO slots (slot_date, slot_time, language, capacity, filled, status)
      VALUES (schedule.exhibition_date, current_time, 'tamil', config.batch_size, 0, 'available')
      ON CONFLICT (slot_date, slot_time, language) DO NOTHING;
      
      -- Create English slot
      INSERT INTO slots (slot_date, slot_time, language, capacity, filled, status)
      VALUES (schedule.exhibition_date, current_time, 'english', config.batch_size, 0, 'available')
      ON CONFLICT (slot_date, slot_time, language) DO NOTHING;
      
      -- Move to next time slot
      current_time := current_time + (config.slot_duration_minutes || ' minutes')::INTERVAL;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Slot Allocation Algorithm

### Core Algorithm Flow

```typescript
interface RegistrationInput {
  name: string;
  churchName: string;
  preferredDate: Date;
  totalPeople: number;
  tamilCount: number;
  englishCount: number;
  phone?: string;
  email?: string;
}

interface AllocationResult {
  success: boolean;
  registrationNumber?: string;
  assignments?: {
    tamil?: SlotInfo;
    english?: SlotInfo;
  };
  waitTimeBetweenSlots?: number;
  error?: string;
  errorCode?: string;
  alternativeDates?: DateAvailability[];
}

// Main allocation function
async function allocateSlots(registration: RegistrationInput): Promise<AllocationResult> {
  
  // Step 1: Validate preferred date
  const schedule = await getScheduleForDate(registration.preferredDate);
  
  if (!schedule || !schedule.is_active) {
    const alternatives = await getNextAvailableDates(registration.preferredDate, 3);
    return {
      success: false,
      error: 'Selected date is not available',
      errorCode: 'DATE_UNAVAILABLE',
      alternativeDates: alternatives
    };
  }
  
  // Step 2: Check date capacity
  const availability = await checkDateAvailability(
    registration.preferredDate,
    registration.tamilCount,
    registration.englishCount
  );
  
  if (!availability.hasCapacity) {
    const alternatives = await getNextAvailableDates(registration.preferredDate, 3);
    return {
      success: false,
      error: `${formatDate(registration.preferredDate)} is fully booked`,
      errorCode: 'DATE_FULLY_BOOKED',
      alternativeDates: alternatives
    };
  }
  
  // Step 3: Allocate slots based on language split
  const { tamilCount, englishCount } = registration;
  
  if (tamilCount > 0 && englishCount === 0) {
    return await allocateSingleLanguage(registration, 'tamil', tamilCount);
  }
  
  if (englishCount > 0 && tamilCount === 0) {
    return await allocateSingleLanguage(registration, 'english', englishCount);
  }
  
  // Mixed language group - need consecutive slots
  return await allocateConsecutiveSlots(registration);
}

// Single language allocation
async function allocateSingleLanguage(
  registration: RegistrationInput,
  language: 'tamil' | 'english',
  count: number
): Promise<AllocationResult> {
  
  // Find available slots on preferred date
  const availableSlots = await findAvailableSlots(
    registration.preferredDate,
    language,
    count
  );
  
  for (const slot of availableSlots) {
    const remainingCapacity = slot.capacity - slot.filled;
    
    if (remainingCapacity >= count) {
      await assignToSlot(slot.id, registration, count, language, 1);
      
      return {
        success: true,
        registrationNumber: generateRegistrationNumber(),
        assignments: {
          [language]: {
            date: formatDate(slot.slot_date),
            time: slot.slot_time,
            slotId: slot.id,
            peopleCount: count
          }
        }
      };
    }
  }
  
  // No existing slot has space - create new slot
  const newSlot = await createNextAvailableSlot(registration.preferredDate, language);
  await assignToSlot(newSlot.id, registration, count, language, 1);
  
  return {
    success: true,
    registrationNumber: generateRegistrationNumber(),
    assignments: {
      [language]: {
        date: formatDate(newSlot.slot_date),
        time: newSlot.slot_time,
        slotId: newSlot.id,
        peopleCount: count
      }
    }
  };
}

// Consecutive slots allocation for mixed groups
async function allocateConsecutiveSlots(
  registration: RegistrationInput
): Promise<AllocationResult> {
  
  const { tamilCount, englishCount, preferredDate } = registration;
  
  // Find consecutive slot pairs on preferred date
  const consecutivePairs = await findConsecutiveSlotPairs(
    preferredDate,
    tamilCount,
    englishCount
  );
  
  for (const pair of consecutivePairs) {
    const { firstSlot, secondSlot, waitTime } = pair;
    
    if (waitTime > 40) continue; // Max 40 min wait
    
    // Try English first, Tamil second
    if (canFit(firstSlot, englishCount) && canFit(secondSlot, tamilCount)) {
      await assignToSlot(firstSlot.id, registration, englishCount, 'english', 1);
      await assignToSlot(secondSlot.id, registration, tamilCount, 'tamil', 2);
      
      return {
        success: true,
        registrationNumber: generateRegistrationNumber(),
        assignments: {
          english: {
            date: formatDate(firstSlot.slot_date),
            time: firstSlot.slot_time,
            slotId: firstSlot.id,
            peopleCount: englishCount
          },
          tamil: {
            date: formatDate(secondSlot.slot_date),
            time: secondSlot.slot_time,
            slotId: secondSlot.id,
            peopleCount: tamilCount
          }
        },
        waitTimeBetweenSlots: waitTime
      };
    }
    
    // Try Tamil first, English second
    if (canFit(firstSlot, tamilCount) && canFit(secondSlot, englishCount)) {
      await assignToSlot(firstSlot.id, registration, tamilCount, 'tamil', 1);
      await assignToSlot(secondSlot.id, registration, englishCount, 'english', 2);
      
      return {
        success: true,
        registrationNumber: generateRegistrationNumber(),
        assignments: {
          tamil: {
            date: formatDate(firstSlot.slot_date),
            time: firstSlot.slot_time,
            slotId: firstSlot.id,
            peopleCount: tamilCount
          },
          english: {
            date: formatDate(secondSlot.slot_date),
            time: secondSlot.slot_time,
            slotId: secondSlot.id,
            peopleCount: englishCount
          }
        },
        waitTimeBetweenSlots: waitTime
      };
    }
  }
  
  // No suitable pairs - create new consecutive slots
  return await createConsecutiveSlotsForGroup(registration);
}

// Get next available dates
async function getNextAvailableDates(
  fromDate: Date,
  count: number = 3
): Promise<DateAvailability[]> {
  
  const query = `
    SELECT 
      es.exhibition_date,
      es.day_type,
      es.start_time,
      es.end_time,
      SUM(CASE WHEN s.language = 'tamil' THEN s.capacity - s.filled ELSE 0 END) as tamil_capacity,
      SUM(CASE WHEN s.language = 'english' THEN s.capacity - s.filled ELSE 0 END) as english_capacity,
      COUNT(DISTINCT s.id) as total_slots,
      SUM(CASE WHEN s.status = 'full' THEN 1 ELSE 0 END) as filled_slots
    FROM exhibition_schedule es
    LEFT JOIN slots s ON s.slot_date = es.exhibition_date
    WHERE es.exhibition_date > $1
      AND es.is_active = true
      AND es.day_type != 'closed'
    GROUP BY es.exhibition_date, es.day_type, es.start_time, es.end_time
    HAVING 
      SUM(CASE WHEN s.language = 'tamil' THEN s.capacity - s.filled ELSE 0 END) > 0
      AND SUM(CASE WHEN s.language = 'english' THEN s.capacity - s.filled ELSE 0 END) > 0
    ORDER BY es.exhibition_date
    LIMIT $2
  `;
  
  const results = await database.query(query, [fromDate, count]);
  
  return results.map(row => ({
    date: row.exhibition_date,
    dayType: row.day_type,
    hours: `${formatTime(row.start_time)} - ${formatTime(row.end_time)}`,
    tamilCapacity: row.tamil_capacity,
    englishCapacity: row.english_capacity,
    fillPercentage: (row.filled_slots / row.total_slots) * 100
  }));
}

// Helper: Assign to slot with transaction
async function assignToSlot(
  slotId: string,
  registration: RegistrationInput,
  peopleCount: number,
  language: 'tamil' | 'english',
  groupSequence: number
): Promise<void> {
  
  await database.transaction(async (trx) => {
    // Lock the slot row
    const slot = await trx('slots')
      .where('id', slotId)
      .forUpdate()
      .first();
    
    if ((slot.capacity - slot.filled) < peopleCount) {
      throw new Error('Slot filled by another registration');
    }
    
    // Create assignment
    await trx('slot_assignments').insert({
      registration_id: registration.id,
      slot_id: slotId,
      people_count: peopleCount,
      language: language,
      group_sequence: groupSequence
    });
    
    // Update slot
    const newFilled = slot.filled + peopleCount;
    const newStatus = newFilled >= slot.capacity ? 'full' : 
                     newFilled > 0 ? 'filling' : 'available';
    
    await trx('slots')
      .where('id', slotId)
      .update({
        filled: newFilled,
        status: newStatus
      });
  });
}
```

---

## 6. User Interface Design

### Registration Form with Date Selection

```typescript
interface RegistrationFormData {
  name: string;
  churchName: string;
  preferredDate: Date;
  totalPeople: number;
  tamilCount: number;
  englishCount: number;
  phone?: string;
  email?: string;
}

function RegistrationForm() {
  const [availableDates, setAvailableDates] = useState<DateInfo[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternatives, setAlternatives] = useState<DateAvailability[]>([]);
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  });
  
  const onSubmit = async (data: RegistrationFormData) => {
    const result = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (result.errorCode === 'DATE_FULLY_BOOKED') {
      setAlternatives(result.alternativeDates);
      setShowAlternatives(true);
    } else if (result.success) {
      // Show confirmation
      router.push(`/confirmation?reg=${result.registrationNumber}`);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input label="Name" {...form.register('name')} />
      <Input label="Church Name" {...form.register('churchName')} />
      
      <DatePicker
        label="Select Your Preferred Date"
        availableDates={availableDates}
        value={form.watch('preferredDate')}
        onChange={(date) => form.setValue('preferredDate', date)}
      />
      
      <Input 
        type="number" 
        label="Total People" 
        {...form.register('totalPeople', { valueAsNumber: true })} 
      />
      
      <LanguageSplitInput
        tamilCount={form.watch('tamilCount')}
        englishCount={form.watch('englishCount')}
        totalPeople={form.watch('totalPeople')}
        onTamilChange={(val) => form.setValue('tamilCount', val)}
        onEnglishChange={(val) => form.setValue('englishCount', val)}
      />
      
      <Button type="submit">Register</Button>
      
      <AlternativeDatesModal
        isOpen={showAlternatives}
        alternatives={alternatives}
        onAccept={(date) => {
          form.setValue('preferredDate', date);
          setShowAlternatives(false);
          form.handleSubmit(onSubmit)();
        }}
        onDecline={() => setShowAlternatives(false)}
      />
    </form>
  );
}
```

### Date Picker Component

```typescript
function DatePicker({ availableDates, value, onChange }: DatePickerProps) {
  return (
    <div className="date-picker">
      <label>Select Your Preferred Date</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {availableDates.map(dateInfo => (
          <DateCard
            key={dateInfo.date}
            date={dateInfo.date}
            dayType={dateInfo.dayType}
            hours={dateInfo.hours}
            availability={dateInfo.availability}
            fillPercentage={dateInfo.fillPercentage}
            isSelected={value === dateInfo.date}
            onClick={() => onChange(dateInfo.date)}
          />
        ))}
      </div>
      
      <div className="flex gap-4 mt-4 text-sm">
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          Filling Fast
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          Fully Booked
        </span>
      </div>
    </div>
  );
}

function DateCard({ date, dayType, hours, availability, fillPercentage, isSelected, onClick }: DateCardProps) {
  const getStatusColor = () => {
    if (availability === 0) return 'bg-red-100 border-red-500';
    if (fillPercentage > 80) return 'bg-yellow-100 border-yellow-500';
    return 'bg-green-100 border-green-500';
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={availability === 0}
      className={`
        p-4 rounded-lg border-2 text-left transition-all
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${getStatusColor()}
        ${availability === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
      `}
    >
      <div className="font-bold text-lg">{format(date, 'MMM d')}</div>
      <div className="text-sm text-gray-600">{format(date, 'EEEE')}</div>
      <div className="text-xs text-gray-500 mt-1">{hours}</div>
      <div className="text-xs font-semibold mt-2">
        {availability > 0 ? `${availability} spots` : 'Fully Booked'}
      </div>
    </button>
  );
}
```

### Alternative Dates Modal

```typescript
function AlternativeDatesModal({ isOpen, alternatives, onAccept, onDecline }: AlternativeDatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onDecline}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Date Unavailable</DialogTitle>
          <DialogDescription>
            Your preferred date is fully booked. Here are the next available dates:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {alternatives.map(alt => (
            <div key={alt.date} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {format(new Date(alt.date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <p className="text-sm text-gray-600">{alt.hours}</p>
                  <p className="text-sm mt-2">
                    Tamil: {alt.tamilCapacity} spots | English: {alt.englishCapacity} spots
                  </p>
                </div>
                <Button onClick={() => onAccept(alt.date)}>
                  Select This Date
                </Button>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${100 - alt.fillPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(100 - alt.fillPercentage)}% available
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onDecline}>
            Choose Different Date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. API Specifications

### API Endpoints

#### POST /api/register
Register a new visitor group

**Request Body:**
```json
{
  "name": "John Doe",
  "churchName": "Grace Church",
  "preferredDate": "2026-06-07",
  "totalPeople": 10,
  "tamilCount": 5,
  "englishCount": 5,
  "phone": "+91 9876543210",
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "registrationNumber": "BE-ABC123",
  "assignments": {
    "tamil": {
      "date": "2026-06-07",
      "time": "10:00",
      "peopleCount": 5
    },
    "english": {
      "date": "2026-06-07",
      "time": "10:20",
      "peopleCount": 5
    }
  },
  "waitTimeBetweenSlots": 20
}
```

**Error Response - Date Full (200):**
```json
{
  "success": false,
  "errorCode": "DATE_FULLY_BOOKED",
  "error": "June 7, 2026 is fully booked",
  "alternativeDates": [
    {
      "date": "2026-06-08",
      "dayType": "weekend",
      "hours": "9:00 AM - 8:00 PM",
      "tamilCapacity": 250,
      "englishCapacity": 280,
      "fillPercentage": 45
    }
  ]
}
```

#### GET /api/dates/available
Get all available dates with capacity

**Response (200):**
```json
{
  "dates": [
    {
      "date": "2026-06-06",
      "dayType": "friday",
      "hours": "6:00 PM - 9:00 PM",
      "tamilCapacity": 90,
      "englishCapacity": 90,
      "fillPercentage": 0,
      "status": "available"
    },
    {
      "date": "2026-06-07",
      "dayType": "weekend",
      "hours": "9:00 AM - 8:00 PM",
      "tamilCapacity": 150,
      "englishCapacity": 200,
      "fillPercentage": 65,
      "status": "filling"
    }
  ]
}
```

#### GET /api/dates/:date/availability
Check specific date availability

**Response (200):**
```json
{
  "date": "2026-06-07",
  "hasCapacity": true,
  "tamilCapacity": 150,
  "englishCapacity": 200,
  "totalSlots": 33,
  "filledSlots": 22,
  "fillPercentage": 66.7
}
```

#### GET /api/admin/schedule
Get exhibition schedule (Admin only)

**Response (200):**
```json
{
  "schedule": [
    {
      "date": "2026-06-06",
      "dayType": "friday",
      "startTime": "18:00",
      "endTime": "21:00",
      "isActive": true,
      "totalBookings": 45,
      "capacity": 180
    }
  ]
}
```

#### PUT /api/admin/schedule/:date
Update schedule for specific date (Admin only)

**Request Body:**
```json
{
  "isActive": true,
  "startTime": "09:00",
  "endTime": "19:00",
  "notes": "Extended hours due to high demand"
}
```

---

## 8. Implementation Guide

### Project Setup

```bash
# Create Next.js project
npx create-next-app@latest bible-exhibition-registration \
  --typescript --tailwind --app --eslint

cd bible-exhibition-registration

# Install dependencies
npm install @supabase/supabase-js
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
npm install qrcode.react
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install lucide-react
npm install recharts
npm install sonner # For toast notifications

# Initialize Git
git init
git add .
git commit -m "Initial commit"
```

### Environment Variables

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EXHIBITION_NAME=Bible Exhibition 2026

# Admin
ADMIN_PASSWORD=your_secure_password

# Optional: Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Project Structure

```
bible-exhibition-registration/
├── app/
│   ├── api/
│   │   ├── register/route.ts
│   │   ├── dates/
│   │   │   ├── available/route.ts
│   │   │   └── [date]/availability/route.ts
│   │   └── admin/
│   │       └── schedule/route.ts
│   ├── register/page.tsx
│   ├── confirmation/page.tsx
│   ├── admin/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── RegistrationForm.tsx
│   ├── DatePicker.tsx
│   ├── AlternativeDatesModal.tsx
│   └── AdminDashboard.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── allocation/algorithm.ts
│   ├── validation/schemas.ts
│   └── utils.ts
└── types/index.ts
```

### Development Timeline

| Phase | Days | Tasks |
|-------|------|-------|
| **Setup** | 1-2 | Project init, database schema, environment |
| **Core Features** | 3-5 | Registration form, date picker, validation |
| **Algorithm** | 6-8 | Slot allocation, alternative dates |
| **Admin** | 9-10 | Dashboard, schedule management |
| **Testing** | 11-12 | E2E tests, load testing, bug fixes |
| **Deployment** | 13-14 | Production deploy, QR code, documentation |

---

## 9. Testing Strategy

### Unit Tests

```typescript
describe('Slot Allocation Algorithm', () => {
  test('allocates single language correctly', async () => {
    const registration = {
      preferredDate: new Date('2026-06-07'),
      tamilCount: 5,
      englishCount: 0,
      totalPeople: 5
    };
    
    const result = await allocateSlots(registration);
    expect(result.success).toBe(true);
    expect(result.assignments.tamil).toBeDefined();
  });
  
  test('suggests alternatives when date is full', async () => {
    // Fill all slots for June 7
    await fillAllSlots('2026-06-07');
    
    const registration = {
      preferredDate: new Date('2026-06-07'),
      tamilCount: 5,
      englishCount: 5,
      totalPeople: 10
    };
    
    const result = await allocateSlots(registration);
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('DATE_FULLY_BOOKED');
    expect(result.alternativeDates).toHaveLength(3);
  });
  
  test('allocates consecutive slots for mixed groups', async () => {
    const registration = {
      preferredDate: new Date('2026-06-07'),
      tamilCount: 5,
      englishCount: 5,
      totalPeople: 10
    };
    
    const result = await allocateSlots(registration);
    expect(result.success).toBe(true);
    expect(result.assignments.tamil).toBeDefined();
    expect(result.assignments.english).toBeDefined();
    expect(result.waitTimeBetweenSlots).toBeLessThanOrEqual(40);
  });
});
```

### Integration Tests

```typescript
describe('Registration Flow', () => {
  test('complete registration with date selection', async () => {
    // Get available dates
    const datesResponse = await fetch('/api/dates/available');
    const { dates } = await datesResponse.json();
    expect(dates.length).toBeGreaterThan(0);
    
    // Register with first available date
    const registration = {
      name: 'Test User',
      churchName: 'Test Church',
      preferredDate: dates[0].date,
      totalPeople: 10,
      tamilCount: 5,
      englishCount: 5
    };
    
    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(registration)
    });
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toBeDefined();
  });
});
```

### Load Testing

```typescript
// Test 100 concurrent registrations
test('handles 100 concurrent registrations', async () => {
  const registrations = Array(100).fill(null).map((_, i) => ({
    name: `User ${i}`,
    churchName: `Church ${i % 10}`,
    preferredDate: '2026-06-07',
    tamilCount: Math.floor(Math.random() * 5) + 1,
    englishCount: Math.floor(Math.random() * 5) + 1,
    totalPeople: 0
  }));
  
  registrations.forEach(r => r.totalPeople = r.tamilCount + r.englishCount);
  
  const results = await Promise.all(
    registrations.map(r => fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(r)
    }))
  );
  
  const successful = results.filter(r => r.ok);
  expect(successful.length).toBeGreaterThan(90); // At least 90% success
});
```

---

## 10. Deployment Plan

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Slots initialized for June 5-21
- [ ] Error handling implemented
- [ ] Mobile responsive verified
- [ ] Cross-browser testing done
- [ ] Admin dashboard functional
- [ ] QR code generated

### Vercel Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import GitHub repository
   - Configure environment variables
   - Deploy

3. **Post-Deployment**
   - Test production URL
   - Verify database connection
   - Test complete registration flow
   - Generate QR code with production URL
   - Set up monitoring alerts

### QR Code Generation

```typescript
import QRCode from 'qrcode.react';

function generateQRCode() {
  const productionURL = 'https://your-app.vercel.app/register';
  
  return (
    <QRCode
      value={productionURL}
      size={512}
      level="H"
      includeMargin={true}
    />
  );
}
```

### Monitoring Setup

- **Vercel Analytics**: Automatic
- **Supabase Dashboard**: Monitor database usage
- **Better Uptime**: Set up health check for `/api/health`
- **Error Tracking**: Implement error logging

---

## 📊 Success Metrics

### Technical Metrics
- ✅ Page load time < 2 seconds
- ✅ API response time < 500ms
- ✅ 99.9% uptime
- ✅ Handle 100+ concurrent users
- ✅ Zero data loss

### Business Metrics
- ✅ Registration completion rate > 95%
- ✅ Average slot fill rate > 80%
- ✅ User satisfaction with date selection
- ✅ Smooth alternative date acceptance

---

## 🚀 Launch Readiness

### Week Before Launch (May 29 - June 4)
- [ ] Final testing in production
- [ ] Print QR codes
- [ ] Train staff on admin dashboard
- [ ] Prepare backup plan
- [ ] Monitor system health

### Launch Day (June 5)
- [ ] System monitoring active
- [ ] Admin dashboard accessible
- [ ] QR codes distributed
- [ ] Support team ready

### During Exhibition (June 5-21)
- [ ] Daily capacity monitoring
- [ ] Quick response to issues
- [ ] Activate weekdays if needed
- [ ] Collect user feedback

---

## 📞 Support & Maintenance

### Daily Tasks
- Check registration count
- Monitor slot fill rates
- Review error logs
- Verify system uptime

### Emergency Contacts
- Developer: [Your contact]
- Hosting: Vercel support
- Database: Supabase support

---

**Document Status**: ✅ Final - Ready for Implementation  
**Total Estimated Development Time**: 80-100 hours over 14 days  
**Cost**: $0/month (all free tiers)  
**Launch Date**: June 5, 2026