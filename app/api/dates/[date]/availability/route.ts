import { NextRequest, NextResponse } from 'next/server';
import { checkDateAvailability } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;
    const searchParams = request.nextUrl.searchParams;
    const tamilCount = parseInt(searchParams.get('tamilCount') || '0');
    const englishCount = parseInt(searchParams.get('englishCount') || '0');

    const availability = await checkDateAvailability(
      date,
      tamilCount,
      englishCount
    );

    return NextResponse.json({
      date,
      ...availability,
    });
  } catch (error) {
    console.error('Error checking date availability:', error);
    return NextResponse.json(
      {
        error: 'Failed to check date availability',
      },
      { status: 500 }
    );
  }
}

// Made with Bob
