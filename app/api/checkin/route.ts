import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const { token, adminKey, registration_number, admin_password } = await request.json();

    // Support both token-based and registration_number-based check-in
    const qrToken = token;
    const regNumber = registration_number;
    const password = adminKey || admin_password;

    if (!qrToken && !regNumber) {
      return NextResponse.json(
        { success: false, error: 'QR token or registration number is required' },
        { status: 400 }
      );
    }

    // Verify admin password for check-in authorization
    const expectedAdminPassword = process.env.ADMIN_PASSWORD;
    if (!password || password !== expectedAdminPassword) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin password' },
        { status: 401 }
      );
    }

    // Find registration by QR token or registration number
    let whereClause = '';
    let params: string[] = [];
    
    if (qrToken) {
      whereClause = 'WHERE r.qr_token = $1';
      params = [qrToken];
    } else {
      whereClause = 'WHERE r.registration_number = $1';
      params = [regNumber];
    }

    const registrationResult = await query<{
      id: string;
      registration_number: string;
      name: string;
      church_name: string;
      total_people: number;
      checked_in: boolean;
      checked_in_at: string | null;
    }>(
      `SELECT
        r.id,
        r.registration_number,
        r.name,
        r.church_name,
        r.total_people,
        r.checked_in,
        r.checked_in_at
      FROM registrations r
      ${whereClause}`,
      params
    );

    if (registrationResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid QR code' },
        { status: 404 }
      );
    }

    const registration = registrationResult[0];

    // Check if already checked in
    if (registration.checked_in) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        registration: {
          registrationNumber: registration.registration_number,
          name: registration.name,
          churchName: registration.church_name,
          totalPeople: registration.total_people,
          checkedInAt: registration.checked_in_at,
        },
        message: 'Already checked in',
      });
    }

    // Mark as checked in
    await query(
      `UPDATE registrations
       SET checked_in = true,
           checked_in_at = NOW(),
           checked_in_by = $1
       WHERE id = $2`,
      ['admin', registration.id]
    );

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      registration: {
        registrationNumber: registration.registration_number,
        name: registration.name,
        churchName: registration.church_name,
        totalPeople: registration.total_people,
        checkedInAt: new Date().toISOString(),
      },
      message: 'Check-in successful',
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}

// Made with Bob
