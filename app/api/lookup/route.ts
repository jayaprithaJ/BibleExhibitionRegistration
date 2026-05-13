import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Query registrations by phone number
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
      checked_in: boolean;
      checked_in_at: string | null;
      slot_info: string;
      slot_times: string;
      qr_token: string;
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
        r.checked_in,
        r.checked_in_at,
        r.qr_token,
        STRING_AGG(
          'Slot ' || sa.group_sequence || ': ' || s.slot_time::TEXT || ' (' || sa.language || ': ' || sa.people_count || ')',
          ', '
          ORDER BY sa.group_sequence
        ) as slot_info,
        STRING_AGG(DISTINCT s.slot_time::TEXT, ', ' ORDER BY s.slot_time::TEXT) as slot_times
      FROM registrations r
      LEFT JOIN slot_assignments sa ON r.id = sa.registration_id
      LEFT JOIN slots s ON sa.slot_id = s.id
      WHERE r.phone = $1
      GROUP BY r.id, r.registration_number, r.name, r.church_name,
               r.preferred_date, r.total_people, r.tamil_count,
               r.english_count, r.phone, r.email, r.created_at,
               r.checked_in, r.checked_in_at, r.qr_token
      ORDER BY r.created_at DESC`,
      [phone]
    );

    return NextResponse.json(
      {
        success: true,
        registrations,
        count: registrations.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to lookup registrations' },
      { status: 500 }
    );
  }
}

// Made with Bob