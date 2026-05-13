import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { registrationNumber: string } }
) {
  try {
    const { registrationNumber } = params;

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
      qr_token: string;
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
        r.checked_in,
        r.qr_token,
        STRING_AGG(
          'Slot ' || sa.group_sequence || ': ' || s.slot_time::TEXT || ' (' || sa.language || ': ' || sa.people_count || ')',
          ', '
          ORDER BY sa.group_sequence
        ) as slot_info
      FROM registrations r
      LEFT JOIN slot_assignments sa ON r.id = sa.registration_id
      LEFT JOIN slots s ON sa.slot_id = s.id
      WHERE r.registration_number = $1
      GROUP BY r.id, r.registration_number, r.name, r.church_name,
               r.preferred_date, r.total_people, r.tamil_count,
               r.english_count, r.phone, r.email, r.created_at,
               r.checked_in, r.qr_token`,
      [registrationNumber]
    );

    if (registrations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      registration: registrations[0],
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { registrationNumber: string } }
) {
  try {
    const { registrationNumber } = params;

    // Check if registration exists and is not checked in
    const existing = await query<{
      id: string;
      checked_in: boolean;
    }>(
      'SELECT id, checked_in FROM registrations WHERE registration_number = $1',
      [registrationNumber]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    if (existing[0].checked_in) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a registration that has been checked in' },
        { status: 400 }
      );
    }

    // Delete registration (cascade will handle slot_assignments)
    // This will also free up the slots
    await transaction(async (client) => {
      const registrationId = existing[0].id;

      // Get all slot assignments
      const assignments = await client.query(
        `SELECT slot_id, people_count FROM slot_assignments WHERE registration_id = $1`,
        [registrationId]
      );

      // Update slot capacities
      for (const assignment of assignments.rows) {
        await client.query(
          `UPDATE slots 
           SET filled = filled - $1,
               status = CASE 
                 WHEN filled - $1 = 0 THEN 'available'
                 WHEN filled - $1 < capacity THEN 'filling'
                 ELSE status
               END
           WHERE id = $2`,
          [assignment.people_count, assignment.slot_id]
        );
      }

      // Delete the registration (cascade will delete assignments)
      await client.query(
        'DELETE FROM registrations WHERE id = $1',
        [registrationId]
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}

// Made with Bob