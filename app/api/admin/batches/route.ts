import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET() {
  try {
    const batches = await query<{
      registration_id: string;
      registration_number: string;
      church_name: string;
      slot_date: string;
      slot_time: string;
      language: string;
      people_count: number;
      group_sequence: number;
      checked_in: boolean;
      checked_in_at: string | null;
    }>(
      `SELECT 
        r.id as registration_id,
        r.registration_number,
        r.church_name,
        s.slot_date,
        s.slot_time,
        sa.language,
        sa.people_count,
        sa.group_sequence,
        r.checked_in,
        r.checked_in_at
      FROM slot_assignments sa
      JOIN registrations r ON sa.registration_id = r.id
      JOIN slots s ON sa.slot_id = s.id
      ORDER BY s.slot_date, s.slot_time, sa.group_sequence`
    );

    return NextResponse.json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// Made with Bob
