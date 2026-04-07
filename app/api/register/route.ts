import { NextRequest, NextResponse } from 'next/server';
import { allocateSlots } from '@/lib/allocation/algorithm';
import { registrationSchema } from '@/lib/validation/schemas';
import type { RegistrationInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const input: RegistrationInput = {
      name: validationResult.data.name,
      churchName: validationResult.data.churchName,
      preferredDate: validationResult.data.preferredDate,
      totalPeople: validationResult.data.totalPeople,
      tamilCount: validationResult.data.tamilCount,
      englishCount: validationResult.data.englishCount,
      phone: validationResult.data.phone,
      email: validationResult.data.email,
    };

    // Allocate slots
    const result = await allocateSlots(input);

    if (!result.success) {
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during registration. Please try again.',
        errorCode: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

// Made with Bob
