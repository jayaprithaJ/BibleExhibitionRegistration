import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // Delete registration (cascade will handle slot_assignments)
    await query(
      'DELETE FROM registrations WHERE id = $1',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete registration' },
      { status: 500 }
    );
  }
}

// Made with Bob