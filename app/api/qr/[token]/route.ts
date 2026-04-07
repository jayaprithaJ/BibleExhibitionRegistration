import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find registration by QR token and get slot details
    const result = await query<{
      registration_number: string;
      name: string;
      church_name: string;
      total_people: number;
      tamil_count: number;
      english_count: number;
      checked_in: boolean;
      checked_in_at: string | null;
      slot_date: string;
      slot_time: string;
      language: string;
      people_count: number;
      group_sequence: number;
    }>(
      `SELECT 
        r.registration_number,
        r.name,
        r.church_name,
        r.total_people,
        r.tamil_count,
        r.english_count,
        r.checked_in,
        r.checked_in_at,
        s.slot_date,
        s.slot_time,
        sa.language,
        sa.people_count,
        sa.group_sequence
      FROM registrations r
      LEFT JOIN slot_assignments sa ON r.id = sa.registration_id
      LEFT JOIN slots s ON sa.slot_id = s.id
      WHERE r.qr_token = $1
      ORDER BY sa.group_sequence`,
      [token]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid QR code' },
        { status: 404 }
      );
    }

    // Group slots by language
    const slots = result.map((row) => ({
      language: row.language,
      slot_date: row.slot_date,
      slot_time: row.slot_time,
      people_count: row.people_count,
      group_sequence: row.group_sequence,
    }));

    const registration = {
      registration_number: result[0].registration_number,
      name: result[0].name,
      church_name: result[0].church_name,
      total_people: result[0].total_people,
      tamil_count: result[0].tamil_count,
      english_count: result[0].english_count,
      checked_in: result[0].checked_in,
      checked_in_at: result[0].checked_in_at,
      slots,
    };

    return NextResponse.json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error('Error fetching QR details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration details' },
      { status: 500 }
    );
  }
}

// Made with Bob
