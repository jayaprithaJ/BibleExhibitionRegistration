import { NextResponse } from 'next/server';
import { getActiveDates } from '@/lib/db/queries';
import { query } from '@/lib/db/client';
import type { DateInfo } from '@/types';

export async function GET() {
  try {
    const schedule = await getActiveDates();
    
    // Get capacity info for each date
    const datesWithCapacity = await Promise.all(
      schedule.map(async (date) => {
        const capacityResults = await query<{
          tamil_capacity: number;
          english_capacity: number;
          total_slots: number;
          filled_slots: number;
        }>(
          `SELECT 
            SUM(CASE WHEN language = 'tamil' THEN capacity - filled ELSE 0 END) as tamil_capacity,
            SUM(CASE WHEN language = 'english' THEN capacity - filled ELSE 0 END) as english_capacity,
            COUNT(*) as total_slots,
            SUM(CASE WHEN status = 'full' THEN 1 ELSE 0 END) as filled_slots
          FROM slots
          WHERE slot_date = $1`,
          [date.exhibition_date]
        );

        const capacity = capacityResults[0];
        const totalCapacity = Number(capacity.tamil_capacity) + Number(capacity.english_capacity);
        const fillPercentage = capacity.total_slots > 0
          ? (capacity.filled_slots / capacity.total_slots) * 100
          : 0;

        const dateInfo: DateInfo = {
          date: date.exhibition_date,
          dayType: date.day_type,
          hours: `${date.start_time} - ${date.end_time}`,
          availability: totalCapacity,
          fillPercentage,
          isActive: date.is_active,
        };

        return dateInfo;
      })
    );

    return NextResponse.json({
      dates: datesWithCapacity,
    });
  } catch (error) {
    console.error('Error fetching available dates:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch available dates',
      },
      { status: 500 }
    );
  }
}

// Made with Bob
