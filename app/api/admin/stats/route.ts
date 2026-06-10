import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET() {
  try {
    // Get registration statistics
    const registrationStats = await query<{
      total_registrations: number;
      today_registrations: number;
      today_people: number;
      total_people: number;
    }>(
      `SELECT
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_registrations,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_people ELSE 0 END), 0) as today_people,
        COALESCE(SUM(total_people), 0) as total_people
      FROM registrations`
    );

    // Get slot statistics
    const slotStats = await query<{
      total_capacity: number;
      filled_capacity: number;
      available_capacity: number;
    }>(
      `SELECT 
        SUM(capacity) as total_capacity,
        SUM(filled) as filled_capacity,
        SUM(capacity - filled) as available_capacity
      FROM slots`
    );

    // Get date-wise breakdown - show ALL dates including closed weekdays
    // Include both slot fills AND registration counts
    const dateBreakdown = await query<{
      slot_date: string;
      day_type: string;
      total_capacity: number;
      filled_capacity: number;
      registered_people: number;
      available_capacity: number;
      fill_percentage: number;
      total_slots: number;
      full_slots: number;
    }>(
      `SELECT
        es.exhibition_date as slot_date,
        es.day_type,
        COALESCE(SUM(s.capacity), 0) as total_capacity,
        COALESCE(SUM(s.filled), 0) as filled_capacity,
        COALESCE(SUM(r.total_people), 0) as registered_people,
        COALESCE(SUM(s.capacity - s.filled), 0) as available_capacity,
        ROUND((COALESCE(SUM(s.filled), 0)::numeric / NULLIF(SUM(s.capacity), 0)) * 100, 1) as fill_percentage,
        COUNT(DISTINCT s.id) as total_slots,
        COUNT(DISTINCT CASE WHEN s.status = 'full' THEN s.id END) as full_slots
      FROM exhibition_schedule es
      LEFT JOIN slots s ON s.slot_date = es.exhibition_date
      LEFT JOIN registrations r ON r.preferred_date = es.exhibition_date
      GROUP BY es.exhibition_date, es.day_type
      ORDER BY es.exhibition_date`
    );

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalRegistrations: registrationStats[0].total_registrations,
          todayRegistrations: registrationStats[0].today_people, // Changed to show people count instead of registration count
          totalPeople: registrationStats[0].total_people,
          totalCapacity: slotStats[0].total_capacity,
          filledCapacity: slotStats[0].filled_capacity,
          availableCapacity: slotStats[0].available_capacity,
          fillPercentage: slotStats[0].total_capacity > 0
            ? ((slotStats[0].filled_capacity / slotStats[0].total_capacity) * 100).toFixed(1)
            : 0,
        },
        dateBreakdown,
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
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// Made with Bob