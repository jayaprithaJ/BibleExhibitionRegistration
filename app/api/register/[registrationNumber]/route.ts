import { NextResponse } from 'next/server';
import { getRegistrationWithSlots } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: { registrationNumber: string } }
) {
  try {
    const { registrationNumber } = params;

    if (!registrationNumber) {
      return NextResponse.json(
        { success: false, error: 'Registration number is required' },
        { status: 400 }
      );
    }

    const registration = await getRegistrationWithSlots(registrationNumber);

    return NextResponse.json({
      success: true,
      registration: {
        ...registration,
        qr_token: registration.qr_token,
      },
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    
    if (error instanceof Error && error.message === 'Registration not found') {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration details' },
      { status: 500 }
    );
  }
}

// Made with Bob