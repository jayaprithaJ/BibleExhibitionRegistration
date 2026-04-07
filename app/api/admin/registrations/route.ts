import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET() {
  try {
    const registrations = await query<{
      id: string;
      registration_number: string;
      name: string;
      church_name: string;
      preferred_date: string;
      total_people: number;
      tamil_count: number;
      english_count: number;
      phone: string;
      email: string;
      created_at: string;
      slot_info: string;
    }>(
      `SELECT 
        r.id,
        r.registration_number,
        r.name,
        r.church_name,
        r.preferred_date,
        r.total_people,
        r.tamil_count,
        r.english_count,
        r.phone,
        r.email,
        r.created_at,
        STRING_AGG(
          'Slot ' || sa.group_sequence || ': ' || s.slot_time || ' (' || sa.language || ': ' || sa.people_count || ')',
          ', '
          ORDER BY sa.group_sequence
        ) as slot_info
      FROM registrations r
      LEFT JOIN slot_assignments sa ON r.id = sa.registration_id
      LEFT JOIN slots s ON sa.slot_id = s.id
      GROUP BY r.id, r.registration_number, r.name, r.church_name, 
               r.preferred_date, r.total_people, r.tamil_count, 
               r.english_count, r.phone, r.email, r.created_at
      ORDER BY r.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

// Made with Bob