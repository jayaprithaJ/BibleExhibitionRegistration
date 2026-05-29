import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import crypto from 'crypto';

interface SpotRegistrationInput {
  name: string;
  churchName: string;
  totalPeople: number;
  phone?: string;
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { name, churchName, totalPeople, phone, email }: SpotRegistrationInput = body;
    
    if (!name || !churchName || !totalPeople) {
      return NextResponse.json(
        { success: false, error: 'Name, church name, and number of people are required' },
        { status: 400 }
      );
    }

    // Validate at least one contact method
    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: 'Either phone number or email is required' },
        { status: 400 }
      );
    }

    // Validate total people
    if (totalPeople < 1 || totalPeople > 50) {
      return NextResponse.json(
        { success: false, error: 'Number of people must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Generate registration number with SPOT prefix
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const registrationNumber = `BE-SPOT${timestamp}-${random}`;

    // Generate QR token
    const qrToken = crypto.randomBytes(32).toString('hex');

    // Get current date and time in IST
    const now = new Date();
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    // Insert spot registration into database
    // Note: No slot assignments for spot registrations
    // Set all people to tamil_count to satisfy database constraints
    await query(
      `INSERT INTO registrations (
        registration_number,
        name,
        church_name,
        preferred_date,
        total_people,
        tamil_count,
        english_count,
        phone,
        email,
        qr_token,
        created_at,
        checked_in
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        registrationNumber,
        name,
        churchName,
        istDate, // Use current date as preferred_date
        totalPeople,
        totalPeople, // Set all to tamil to satisfy constraint
        0, // english_count = 0
        phone || '',
        email || '',
        qrToken,
        now,
        false // Not checked in yet
      ]
    );

    return NextResponse.json({
      success: true,
      registrationNumber,
      qrToken,
      message: 'Spot registration successful',
      registeredAt: istDate.toISOString(),
    });
  } catch (error) {
    console.error('Spot registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process spot registration' },
      { status: 500 }
    );
  }
}

// Made with Bob