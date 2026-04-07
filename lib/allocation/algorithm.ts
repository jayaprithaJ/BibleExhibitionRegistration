import {
  getScheduleForDate,
  checkDateAvailability,
  getNextAvailableDates,
  findAvailableSlots,
  findConsecutiveSlotPairs,
  createRegistration,
  assignToSlot,
} from '@/lib/db/queries';
import type {
  RegistrationInput,
  AllocationResult,
  SlotInfo,
  Slot,
} from '@/types';

/**
 * Generate a unique registration number
 */
function generateRegistrationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BE-${timestamp}-${random}`;
}

/**
 * Check if a slot can fit the specified number of people
 */
function canFit(slot: Slot, peopleCount: number): boolean {
  return slot.capacity - slot.filled >= peopleCount;
}

/**
 * Convert slot to SlotInfo format
 */
function toSlotInfo(slot: Slot, peopleCount: number): SlotInfo {
  return {
    date: slot.slot_date,
    time: slot.slot_time,
    slotId: slot.id,
    peopleCount,
  };
}

/**
 * Main slot allocation function
 */
export async function allocateSlots(
  input: RegistrationInput
): Promise<AllocationResult> {
  try {
    // Step 1: Validate preferred date
    const schedule = await getScheduleForDate(input.preferredDate);

    if (!schedule || !schedule.is_active) {
      const alternatives = await getNextAvailableDates(input.preferredDate, 3);
      return {
        success: false,
        error: 'Selected date is not available',
        errorCode: 'DATE_UNAVAILABLE',
        alternativeDates: alternatives,
      };
    }

    // Step 2: Check date capacity
    const availability = await checkDateAvailability(
      input.preferredDate,
      input.tamilCount,
      input.englishCount
    );

    if (!availability.hasCapacity) {
      const alternatives = await getNextAvailableDates(input.preferredDate, 3);
      return {
        success: false,
        error: `${input.preferredDate} is fully booked`,
        errorCode: 'DATE_FULLY_BOOKED',
        alternativeDates: alternatives,
      };
    }

    // Step 3: Generate registration number
    const registrationNumber = generateRegistrationNumber();

    // Step 4: Create registration record
    const registration = await createRegistration({
      registration_number: registrationNumber,
      name: input.name,
      church_name: input.churchName,
      preferred_date: input.preferredDate,
      total_people: input.totalPeople,
      tamil_count: input.tamilCount,
      english_count: input.englishCount,
      phone: input.phone,
      email: input.email,
    });

    // Step 5: Allocate slots based on language split
    const { tamilCount, englishCount } = input;

    if (tamilCount > 0 && englishCount === 0) {
      // Only Tamil
      return await allocateSingleLanguage(
        registration.id,
        input.preferredDate,
        'tamil',
        tamilCount,
        registrationNumber
      );
    }

    if (englishCount > 0 && tamilCount === 0) {
      // Only English
      return await allocateSingleLanguage(
        registration.id,
        input.preferredDate,
        'english',
        englishCount,
        registrationNumber
      );
    }

    // Mixed language group - need consecutive slots
    return await allocateConsecutiveSlots(
      registration.id,
      input.preferredDate,
      tamilCount,
      englishCount,
      registrationNumber
    );
  } catch (error) {
    console.error('Allocation error:', error);
    return {
      success: false,
      error: 'An error occurred during registration. Please try again.',
      errorCode: 'ALLOCATION_ERROR',
    };
  }
}

/**
 * Allocate slot for single language group
 */
async function allocateSingleLanguage(
  registrationId: string,
  date: string,
  language: 'tamil' | 'english',
  count: number,
  registrationNumber: string
): Promise<AllocationResult> {
  // Find available slots with any space (minimum 1)
  const availableSlots = await findAvailableSlots(date, language, 1);

  if (availableSlots.length === 0) {
    return {
      success: false,
      error: 'No available slots found. Please try a different date.',
      errorCode: 'NO_SLOTS_AVAILABLE',
    };
  }

  let remainingCount = count;
  const assignments: SlotInfo[] = [];
  let groupSequence = 1;

  // Allocate across multiple slots if needed
  for (const slot of availableSlots) {
    if (remainingCount <= 0) break;

    const availableInSlot = slot.capacity - slot.filled;
    const toAllocate = Math.min(remainingCount, availableInSlot);

    if (toAllocate > 0) {
      await assignToSlot(slot.id, registrationId, toAllocate, language, groupSequence);
      assignments.push(toSlotInfo(slot, toAllocate));
      remainingCount -= toAllocate;
      groupSequence++;
    }
  }

  if (remainingCount > 0) {
    return {
      success: false,
      error: 'Insufficient capacity. Please try a different date or reduce group size.',
      errorCode: 'INSUFFICIENT_CAPACITY',
    };
  }

  // Return all slot assignments
  return {
    success: true,
    registrationNumber,
    assignments: {
      [language]: assignments,
    },
  };
}

/**
 * Allocate consecutive slots for mixed language group
 */
async function allocateConsecutiveSlots(
  registrationId: string,
  date: string,
  tamilCount: number,
  englishCount: number,
  registrationNumber: string
): Promise<AllocationResult> {
  // For mixed language groups, we need to split each language across multiple slots if needed
  const tamilAssignments: SlotInfo[] = [];
  const englishAssignments: SlotInfo[] = [];
  
  let tamilRemaining = tamilCount;
  let englishRemaining = englishCount;
  let groupSequence = 1;

  // Allocate Tamil slots
  if (tamilCount > 0) {
    const tamilSlots = await findAvailableSlots(date, 'tamil', 1);
    
    for (const slot of tamilSlots) {
      if (tamilRemaining <= 0) break;
      
      const availableInSlot = slot.capacity - slot.filled;
      const toAllocate = Math.min(tamilRemaining, availableInSlot);
      
      if (toAllocate > 0) {
        await assignToSlot(slot.id, registrationId, toAllocate, 'tamil', groupSequence);
        tamilAssignments.push(toSlotInfo(slot, toAllocate));
        tamilRemaining -= toAllocate;
        groupSequence++;
      }
    }
  }

  // Allocate English slots
  if (englishCount > 0) {
    const englishSlots = await findAvailableSlots(date, 'english', 1);
    
    for (const slot of englishSlots) {
      if (englishRemaining <= 0) break;
      
      const availableInSlot = slot.capacity - slot.filled;
      const toAllocate = Math.min(englishRemaining, availableInSlot);
      
      if (toAllocate > 0) {
        await assignToSlot(slot.id, registrationId, toAllocate, 'english', groupSequence);
        englishAssignments.push(toSlotInfo(slot, toAllocate));
        englishRemaining -= toAllocate;
        groupSequence++;
      }
    }
  }

  // Check if we successfully allocated all people
  if (tamilRemaining > 0 || englishRemaining > 0) {
    return {
      success: false,
      error: 'Insufficient capacity. Please try a different date or reduce group size.',
      errorCode: 'INSUFFICIENT_CAPACITY',
    };
  }

  // Calculate wait time between first Tamil and first English slot
  let waitTime = 0;
  if (tamilAssignments.length > 0 && englishAssignments.length > 0) {
    const tamilTime = new Date(`2000-01-01T${tamilAssignments[0].time}`);
    const englishTime = new Date(`2000-01-01T${englishAssignments[0].time}`);
    waitTime = Math.abs((englishTime.getTime() - tamilTime.getTime()) / 60000);
  }

  return {
    success: true,
    registrationNumber,
    assignments: {
      tamil: tamilAssignments.length > 0 ? tamilAssignments : undefined,
      english: englishAssignments.length > 0 ? englishAssignments : undefined,
    },
    waitTimeBetweenSlots: waitTime,
  };
}

// Made with Bob
