import { query, transaction } from './client';
import type {
  Registration,
  Slot,
  SlotAssignment,
  ExhibitionSchedule,
  DateAvailability,
  AvailabilityCheck,
} from '@/types';

/**
 * Get exhibition schedule for a specific date
 */
export async function getScheduleForDate(
  date: string
): Promise<ExhibitionSchedule | null> {
  const results = await query<ExhibitionSchedule>(
    'SELECT * FROM exhibition_schedule WHERE exhibition_date = $1',
    [date]
  );
  return results[0] || null;
}

/**
 * Get all active exhibition dates
 */
export async function getActiveDates(): Promise<ExhibitionSchedule[]> {
  return await query<ExhibitionSchedule>(
    `SELECT * FROM exhibition_schedule 
     WHERE is_active = true AND day_type != 'closed'
     ORDER BY exhibition_date`
  );
}

/**
 * Check date availability for specific language counts
 */
export async function checkDateAvailability(
  date: string,
  tamilCount: number,
  englishCount: number
): Promise<AvailabilityCheck> {
  const results = await query<{
    tamil_capacity: number;
    english_capacity: number;
  }>(
    `SELECT 
      SUM(CASE WHEN language = 'tamil' THEN capacity - filled ELSE 0 END) as tamil_capacity,
      SUM(CASE WHEN language = 'english' THEN capacity - filled ELSE 0 END) as english_capacity
     FROM slots
     WHERE slot_date = $1`,
    [date]
  );

  const { tamil_capacity, english_capacity } = results[0];

  const canFitTamil = tamilCount === 0 || tamil_capacity >= tamilCount;
  const canFitEnglish = englishCount === 0 || english_capacity >= englishCount;

  return {
    hasCapacity: canFitTamil && canFitEnglish,
    tamilAvailable: tamil_capacity || 0,
    englishAvailable: english_capacity || 0,
    reason:
      !canFitTamil || !canFitEnglish ? 'INSUFFICIENT_CAPACITY' : undefined,
  };
}

/**
 * Get next available dates with capacity
 */
export async function getNextAvailableDates(
  fromDate: string,
  count: number = 3
): Promise<DateAvailability[]> {
  const results = await query<{
    exhibition_date: string;
    day_type: string;
    start_time: string;
    end_time: string;
    tamil_capacity: number;
    english_capacity: number;
    total_slots: number;
    filled_slots: number;
  }>(
    `SELECT 
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
    LIMIT $2`,
    [fromDate, count]
  );

  return results.map((row) => ({
    date: row.exhibition_date,
    dayType: row.day_type,
    hours: `${row.start_time} - ${row.end_time}`,
    tamilCapacity: row.tamil_capacity,
    englishCapacity: row.english_capacity,
    fillPercentage: (row.filled_slots / row.total_slots) * 100,
    status:
      row.filled_slots === 0
        ? 'available'
        : row.filled_slots / row.total_slots > 0.8
        ? 'filling'
        : 'available',
  }));
}

/**
 * Find available slots for a specific date and language
 */
export async function findAvailableSlots(
  date: string,
  language: 'tamil' | 'english',
  minCapacity: number
): Promise<Slot[]> {
  return await query<Slot>(
    `SELECT * FROM slots
     WHERE slot_date = $1
       AND language = $2
       AND status != 'full'
       AND (capacity - filled) >= $3
     ORDER BY slot_time`,
    [date, language, minCapacity]
  );
}

/**
 * Find consecutive slot pairs for mixed language groups
 */
export async function findConsecutiveSlotPairs(
  date: string,
  tamilCount: number,
  englishCount: number
): Promise<
  Array<{
    firstSlot: Slot;
    secondSlot: Slot;
    waitTime: number;
  }>
> {
  const results = await query<{
    first_slot_id: string;
    first_date: string;
    first_time: string;
    first_language: string;
    first_capacity: number;
    first_filled: number;
    first_status: string;
    second_slot_id: string;
    second_date: string;
    second_time: string;
    second_language: string;
    second_capacity: number;
    second_filled: number;
    second_status: string;
    wait_minutes: number;
  }>(
    `SELECT 
      s1.id as first_slot_id,
      s1.slot_date as first_date,
      s1.slot_time as first_time,
      s1.language as first_language,
      s1.capacity as first_capacity,
      s1.filled as first_filled,
      s1.status as first_status,
      s2.id as second_slot_id,
      s2.slot_date as second_date,
      s2.slot_time as second_time,
      s2.language as second_language,
      s2.capacity as second_capacity,
      s2.filled as second_filled,
      s2.status as second_status,
      EXTRACT(EPOCH FROM (s2.slot_time - s1.slot_time)) / 60 as wait_minutes
    FROM slots s1
    JOIN slots s2 ON s1.slot_date = s2.slot_date
    WHERE s1.slot_date = $1
      AND s1.status != 'full'
      AND s2.status != 'full'
      AND s1.language != s2.language
      AND s2.slot_time > s1.slot_time
      AND EXTRACT(EPOCH FROM (s2.slot_time - s1.slot_time)) / 60 BETWEEN 20 AND 40
    ORDER BY s1.slot_time, wait_minutes`,
    [date]
  );

  return results.map((row) => ({
    firstSlot: {
      id: row.first_slot_id,
      slot_date: row.first_date,
      slot_time: row.first_time,
      language: row.first_language as 'tamil' | 'english',
      capacity: row.first_capacity,
      filled: row.first_filled,
      status: row.first_status as 'available' | 'filling' | 'full',
      created_at: '',
    },
    secondSlot: {
      id: row.second_slot_id,
      slot_date: row.second_date,
      slot_time: row.second_time,
      language: row.second_language as 'tamil' | 'english',
      capacity: row.second_capacity,
      filled: row.second_filled,
      status: row.second_status as 'available' | 'filling' | 'full',
      created_at: '',
    },
    waitTime: row.wait_minutes,
  }));
}

/**
 * Generate a secure QR token
 */
function generateQRToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new registration
 */
export async function createRegistration(
  data: {
    registration_number: string;
    name: string;
    church_name: string;
    preferred_date: string;
    total_people: number;
    tamil_count: number;
    english_count: number;
    phone?: string;
    email?: string;
  }
): Promise<Registration> {
  const qrToken = generateQRToken();
  
  const results = await query<Registration>(
    `INSERT INTO registrations (
      registration_number, name, church_name, preferred_date,
      total_people, tamil_count, english_count, phone, email, qr_token
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      data.registration_number,
      data.name,
      data.church_name,
      data.preferred_date,
      data.total_people,
      data.tamil_count,
      data.english_count,
      data.phone,
      data.email,
      qrToken,
    ]
  );
  return results[0];
}

/**
 * Assign registration to a slot (with transaction)
 */
export async function assignToSlot(
  slotId: string,
  registrationId: string,
  peopleCount: number,
  language: 'tamil' | 'english',
  groupSequence: number
): Promise<void> {
  await transaction(async (client) => {
    // Lock the slot row
    const slotResult = await client.query(
      'SELECT * FROM slots WHERE id = $1 FOR UPDATE',
      [slotId]
    );

    if (slotResult.rows.length === 0) {
      throw new Error('Slot not found');
    }

    const slot = slotResult.rows[0];
    const remainingCapacity = slot.capacity - slot.filled;

    if (remainingCapacity < peopleCount) {
      throw new Error('Slot filled by another registration');
    }

    // Create assignment
    await client.query(
      `INSERT INTO slot_assignments (
        registration_id, slot_id, people_count, language, group_sequence
      ) VALUES ($1, $2, $3, $4, $5)`,
      [registrationId, slotId, peopleCount, language, groupSequence]
    );

    // Update slot
    const newFilled = slot.filled + peopleCount;
    const newStatus =
      newFilled >= slot.capacity
        ? 'full'
        : newFilled > 0
        ? 'filling'
        : 'available';

    await client.query(
      'UPDATE slots SET filled = $1, status = $2 WHERE id = $3',
      [newFilled, newStatus, slotId]
    );
  });
}

/**
 * Get registration with slot assignments
 */
export async function getRegistrationWithSlots(
  registrationNumber: string
): Promise<Registration & { slots: SlotAssignment[] }> {
  const regResults = await query<Registration>(
    'SELECT * FROM registrations WHERE registration_number = $1',
    [registrationNumber]
  );

  if (regResults.length === 0) {
    throw new Error('Registration not found');
  }

  const registration = regResults[0];

  const slotResults = await query<SlotAssignment>(
    `SELECT sa.*, s.slot_date, s.slot_time
     FROM slot_assignments sa
     JOIN slots s ON s.id = sa.slot_id
     WHERE sa.registration_id = $1
     ORDER BY sa.group_sequence`,
    [registration.id]
  );

  return {
    ...registration,
    slots: slotResults,
  };
}

/**
 * Get all registrations (for admin)
 */
export async function getAllRegistrations(
  limit: number = 100,
  offset: number = 0
): Promise<Registration[]> {
  return await query<Registration>(
    `SELECT * FROM registrations 
     ORDER BY created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
}

/**
 * Get registration statistics
 */
export async function getRegistrationStats(): Promise<{
  total: number;
  today: number;
  totalCapacity: number;
  filledCapacity: number;
}> {
  const results = await query<{
    total_registrations: number;
    today_registrations: number;
    total_capacity: number;
    filled_capacity: number;
  }>(
    `SELECT 
      (SELECT COUNT(*) FROM registrations) as total_registrations,
      (SELECT COUNT(*) FROM registrations WHERE DATE(created_at) = CURRENT_DATE) as today_registrations,
      (SELECT SUM(capacity) FROM slots) as total_capacity,
      (SELECT SUM(filled) FROM slots) as filled_capacity`
  );

  return {
    total: results[0].total_registrations,
    today: results[0].today_registrations,
    totalCapacity: results[0].total_capacity,
    filledCapacity: results[0].filled_capacity,
  };
}

// Made with Bob
